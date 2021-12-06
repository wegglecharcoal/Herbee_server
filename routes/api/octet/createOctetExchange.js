/**
 * Created by gunucklee on 2021. 12. 03.
 *
 * @swagger 
 * /api/private/octet/exchange:
 *   post:
 *     summary: 옥텟 재화 교환 (Bee coin <-> 꿀)
 *     tags: [Octet]
 *     description: |
 *       path : /api/private/octet/exchange
 *
 *       * 옥텟 재화 교환 (Bee coin <-> 꿀)
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           옥텟 재화 교환 (Bee coin <-> 꿀)
 *         schema:
 *           type: object
 *           required:
 *             - type
 *             - amount
 *           properties:
 *             type:
 *               type: number
 *               example: 0
 *               description: |
 *                 교환할려는 타입
 *                 * 0: Bee coin -> 꿀
 *                 * 1: 꿀 -> Bee coin
 *             amount:
 *               type: number
 *               example: 5
 *               description: |
 *                 교환 개수
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

            let check = await selectExchangeCheck(req, db_connection);
            switch (req.paramBody['type']) {
                case 0:
                    if(check['own_honey_amount'] < req.paramBody['amount']) {
                        errUtil.createCall(errCode.fail, `소지한 꿀 개수가 부족합니다.`);
                        return;
                    }
                    break;
                case 1:
                    if(check['own_bee_coin_amount'] < req.paramBody['amount']) {
                        errUtil.createCall(errCode.fail, `소지한 BEE coin 개수가 부족합니다.`);
                        return;
                    }
                    break;
                default:
                    break;
            }

            await createOctetExchange(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'amount');
}


function createOctetExchange(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_octet_exchange'
        , [
              req.headers['user_uid']
            , req.paramBody['type']
            , req.paramBody['amount']
        ]
    );
}

function selectExchangeCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honey_octet_bee_coin'
        , [
              req.headers['user_uid']
        ]
    );
}