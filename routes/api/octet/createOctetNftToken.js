/**
 * Created by gunucklee on 2022. 03. 04.
 *
 * @swagger
 * /api/private/octet/nft/token:
 *   post:
 *     summary: 옥텟 NFT Token 생성
 *     tags: [Octet]
 *     description: |
 *       path : /api/private/octet/nft/token
 *
 *       * 옥텟 NFT Token 생성
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           옥텟 출금
 *         schema:
 *           type: object
 *           required:
 *             - token_name
 *             - content
 *             - filename
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
const errCode = require("../../../common/define/errCode");
const octetUtil = require('../../../common/utils/octetUtil');
let file_name = fileUtil.name(__filename);

module.exports = function (req, res) {
    const _funcName = arguments.callee.name;

    try{
        req.file_name = file_name;
        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);

        req.paramBody = paramUtil.parse(req);

        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};


            octetUtil.octetCreateNftToken(req.paramBody['content'], req.paramBody['content'], req.paramBody['content']);
            if(req.paramBody['id']) {
                let check = await querySelectDepositHistoryCheck(req, db_connection);
                paramUtil.checkParam_alreadyUse(check, errCode.already_history,'Error code: 506 [이미 해당 기록이 등록되어 있습니다.]');
                await queryCreateDepositHistory(req, db_connection);
            }
            else {
                let check = await querySelectWithdrawHistoryCheck(req, db_connection);
                paramUtil.checkParam_alreadyUse(check, errCode.already_history,'Error code: 506 [이미 해당 기록이 등록되어 있습니다.]');
                await queryCreateWithdrawHistory(req, db_connection);
            }


            deleteBody(req);
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        } );

    }
    catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}

function checkParam(req) {
}

function deleteBody(req) {
}

function querySelectDepositHistoryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_octet_webhook_deposit_history_check'
        , [
              req.paramBody['id']
            , req.paramBody['coinSymbol']
            , req.paramBody['fromAddress']
            , req.paramBody['toAddress']
            , req.paramBody['amount']
            , req.paramBody['txid']
        ]
    );
}

function queryCreateDepositHistory(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_octet_webhook_deposit_history'
        , [
              req.paramBody['id']
            , req.paramBody['coinSymbol']
            , req.paramBody['fromAddress']
            , req.paramBody['toAddress']
            , req.paramBody['amount']
            , req.paramBody['txid']
        ]
    );
}


function querySelectWithdrawHistoryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_octet_webhook_withdraw_history_check'
        , [
              req.paramBody['idx']
            , req.paramBody['requestId']
            , req.paramBody['type']
            , req.paramBody['status']
            , req.paramBody['coinSymbol']
            , req.paramBody['txid']
            , req.paramBody['fromAddress']
            , req.paramBody['toAddress']
            , req.paramBody['amount']
            , req.paramBody['actualFee']
            , req.paramBody['webhookStatus']
        ]
    );
}

function queryCreateWithdrawHistory(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_octet_webhook_withdraw_history'
        , [
              req.paramBody['idx']
            , req.paramBody['requestId']
            , req.paramBody['type']
            , req.paramBody['status']
            , req.paramBody['coinSymbol']
            , req.paramBody['txid']
            , req.paramBody['fromAddress']
            , req.paramBody['toAddress']
            , req.paramBody['amount']
            , req.paramBody['actualFee']
            , req.paramBody['webhookStatus']
        ]
    );
}

