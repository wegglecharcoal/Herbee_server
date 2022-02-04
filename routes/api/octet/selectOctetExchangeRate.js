/**
 * Created by gunucklee on 2021. 12. 07.
 *
 * @swagger
 * /api/private/octet/exchange/rate:
 *   get:
 *     summary: 꿀 교환 <-> BEE coin 환율
 *     tags: [Octet]
 *     description: |
 *       path : /api/private/octet/exchange/rate
 *
 *       * 꿀 교환 <-> BEE coin 환율
 *
 *     responses:
 *       200:
 *         description: 결과 정보
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
const coinExchangeUtil = require("../../../common/utils/coinExchangeUtil");

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


            let bee_coin_info = await coinExchangeUtil.lBankSelectCoinRate('bee_usdt');

            if(bee_coin_info === 'false') {
                let db_bee_coin_info = await querySelectBeeCoinRate(bee_coin_info, db_connection);
                bee_coin_info = db_bee_coin_info['coin_rate'];
            } else {
                await queryUpdateBeeCoinRate(bee_coin_info, db_connection);
            }

            let bee_coin_rate = Math.floor((10 / (bee_coin_info * 100)));
            req.innerBody['item'] = {
                "exchange_rate" : `1:${bee_coin_rate}`
            }

            deleteBody(req);
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });

    } catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}

function checkParam(req) {
}

function deleteBody(req) {
}

function querySelectBeeCoinRate(coin_rate, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_bee_coin_rate'
        , [
        ]
    );
}

function queryUpdateBeeCoinRate(coin_rate, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_bee_coin_rate'
        , [
            coin_rate
        ]
    );
}