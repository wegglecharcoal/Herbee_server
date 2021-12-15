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

        console.log('a3pio2j: ' + isWithdrawSuccess.length);
        if(isWithdrawSuccess.length === 0 && parseInt(myBeeCoin['octet_bee_coin']) >= req.paramBody['amount'] ) {
            await queryCreateBeeCoinWithdraw(reqId, db_connection);

            await octetUtil.octetCreateWithdraw(reqId, req.paramBody['toAddress'], req.paramBody['amount'],
                get_token_result === 'maintain' ? current_access_token['access_token'] : get_token_result);
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

function queryCreateBeeCoinWithdraw(reqId, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_bee_coin_withdraw'
        , [
            reqId
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

