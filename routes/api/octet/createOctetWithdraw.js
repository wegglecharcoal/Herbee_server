/**
 * Created by gunucklee on 2021. 12. 01.
 *
 * @swagger 
 * /api/private/octet/withdraw:
 *   post:
 *     summary: 옥텟 출금
 *     tags: [Octet]
 *     description: |
 *       path : /api/private/octet/withdraw
 *
 *       * 옥텟 출금
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           옥텟 출금
 *         schema:
 *           type: object
 *           required:
 *             - toAddress
 *             - amount
 *             - feeBeeCoin
 *           properties:
 *             toAddress:
 *               type: string
 *               example: '0xf247267Cf5906A24E21869037D0588A64896A914'
 *               description: |
 *                 지갑 주소
 *             amount:
 *               type: number
 *               example: 10
 *               description: |
 *                 출금 Bee 코인 개수
 *             feeBeeCoin:
 *               type: number
 *               example: 8920
 *               description: |
 *                 출금 Bee 코인 수수료
 *
 *     responses:
 *       400:
 *         description: 에러 코드 400
 *         schema:
 *           $ref: '#/definitions/Error'
 */
const paramUtil = require('../../../common/utils/paramUtil');
const fileUtil = require('../../../common/utils/fileUtil');
const mysqlUtil = require('../../../common/utils/mysqlUtil');
const sendUtil = require('../../../common/utils/sendUtil');
const errUtil = require('../../../common/utils/errUtil');
const logUtil = require('../../../common/utils/logUtil');

const fcmUtil = require('../../../common/utils/fcmUtil');
const octetUtil = require("../../../common/utils/octetUtil");
const errCode = require("../../../common/define/errCode");
const upBitUtil = require("../../../common/utils/upBitUtil");

let file_name = fileUtil.name(__filename);

module.exports = function (req, res) {
    const _funcName = arguments.callee.name;

    try {
        req.file_name = file_name;
        logUtil.printUrlLog(req, `== function start ==================================`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};

            await octetFunction(req, db_connection);

            deleteBody(req);
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });
    }
    catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}

function deleteBody(req) {
}

function checkParam(req) {
    paramUtil.checkParam_noReturn(req.paramBody, 'toAddress');
    paramUtil.checkParam_noReturn(req.paramBody, 'amount');
    paramUtil.checkParam_noReturn(req.paramBody, 'feeBeeCoin');
}


async function octetFunction(req, db_connection) {

    let current_access_token = await querySelectOctetAccessToken(req, db_connection);

    let get_token_result = await octetUtil.octetToken(current_access_token['access_token']);

    if( get_token_result !== 'maintain'
        && get_token_result !== null && get_token_result !== undefined ) {
        await queryUpdateOctetAccessToken(get_token_result, db_connection);
    }
    let address_validation =  await octetUtil.octetSelectAddressValidation(req.paramBody['toAddress']);


    if(address_validation['data']['result']) {

        let myBeeCoin = await querySelectOctetBeeCoin(req, db_connection);

        let reqId = `${req.headers['user_uid']}@${Math.floor(new Date().getTime()) + 1}`;

        let isWithdrawSuccess = await querySelectOctetIsWithdrawSuccess(req, db_connection);



        let own_bee_coin = await querySelectBeeCoin(req,db_connection);


        if(isWithdrawSuccess.length === 0 && parseInt(myBeeCoin['own_bee_coin_amount']) >= req.paramBody['amount'] &&
            own_bee_coin['own_bee_coin_amount'] > req.paramBody['feeBeeCoin']  ) {

            await queryCreateBeeCoinWithdraw(reqId, db_connection);

            let fee_data = {}
            fee_data['reqId'] = reqId;
            fee_data['fee_bee_coin'] = req.paramBody['feeBeeCoin'];

            await queryCreateBeeCoinWithdrawFee(fee_data, db_connection);

            await octetUtil.octetCreateWithdraw(reqId, req.paramBody['toAddress'], req.paramBody['amount'],
                get_token_result === 'maintain' ? current_access_token['access_token'] : get_token_result);
        }
        else if(own_bee_coin['own_bee_coin_amount'] < req.paramBody['feeBeeCoin']  ) {
            errUtil.createCall(errCode.fail, `수수료 비용이 부족합니다. 현재 수수료는 ${req.paramBody['feeBeeCoin']} BEE coin 입니다.`);
            return;
        }
        else if(isWithdrawSuccess.length > 0) {
            errUtil.createCall(errCode.fail, `이전 출금 처리가 완료되지 않았습니다.`);
            return;
        }
        else {
            errUtil.createCall(errCode.fail, `소지한 Bee 코인 개수가 부족합니다.`);
            return;
        }

    }
    else {
        errUtil.createCall(errCode.fail, `유효하지 않은 지갑 주소 형식입니다.`);
        return;
    }

}


// async function isFeeWithdraw(req, db_connection) {
//
//     let fee = await octetUtil.octetSelectFee(get_token_result === 'maintain' ? current_access_token['access_token'] : get_token_result);
//
//     let eth = await upBitUtil.upBitSelectCoinPrice('KRW-ETH');
//
//
//     let fee_won = eth['data'][0]['trade_price'] * fee['data']['fastest'] * parseInt(process.env.OCTET_GWEI) * parseInt(process.env.OCTET_MAX_GAS_COST);
//     let fee_bee_coin = Math.floor(fee_won * 0.1);
//
//     let own_bee_coin = await querySelectBeeCoin(req,db_connection);
//
//     return own_bee_coin['own_bee_coin_amount'] > fee_bee_coin ? 1 : 0;
//
// }


function querySelectBeeCoin(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_octet_bee_coin'
        , [
            req.headers['user_uid']
        ]
    );
}

function queryCreateBeeCoinWithdraw(reqId, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_bee_coin_withdraw'
        , [
            reqId
        ]
    );
}


function queryCreateBeeCoinWithdrawFee(fee_data, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_bee_coin_withdraw_fee'
        , [
              fee_data['reqId']
            , fee_data['fee_bee_coin']
        ]
    );
}

function querySelectOctetBeeCoin(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_octet_bee_coin'
        , [
            req.headers['user_uid']
        ]
    );
}

function querySelectOctetIsWithdrawSuccess(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_octet_is_withdraw_success'
        , [
            req.headers['user_uid']
        ]
    );
}


function querySelectOctetAccessToken(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_octet_access_token'
        , []
    );
}

function queryUpdateOctetAccessToken(accessToken, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_octet_access_token'
        , [
            accessToken
        ]
    );
}

