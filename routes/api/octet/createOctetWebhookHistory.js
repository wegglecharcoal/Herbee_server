/**
 * Created by gunucklee on 2021. 12. 01.
 */
const paramUtil = require('../../../common/utils/paramUtil');
const fileUtil = require('../../../common/utils/fileUtil');
const mysqlUtil = require('../../../common/utils/mysqlUtil');
const sendUtil = require('../../../common/utils/sendUtil');
const errUtil = require('../../../common/utils/errUtil');
const logUtil = require('../../../common/utils/logUtil');

let file_name = fileUtil.name(__filename);

module.exports = function (req, res) {
    const _funcName = arguments.callee.name;

    try{
        req.file_name = file_name;
        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);

        req.paramBody = paramUtil.parse(req);

        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};

            if(req.paramBody['id']) {
                await queryCreateDepositHistory(req, db_connection);
            }
            else {
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
