/**
 * Created by gunucklee on 2021. 12. 15.
 *
 * @swagger
 * /api/private/octet/fee:
 *   get:
 *     summary: 옥텟 수수료
 *     tags: [Octet]
 *     description: |
 *       path : /api/private/octet/fee
 *
 *       * 옥텟 수수료
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
const octetUtil = require("../../../common/utils/octetUtil");
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

            req.innerBody['item'] = await octetFunction(req, db_connection);
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

async function octetFunction(req, db_connection) {

    let current_access_token = await querySelectOctetAccessToken(req, db_connection);

    let get_token_result = await octetUtil.octetToken(current_access_token['access_token']);

    if( get_token_result !== 'maintain'
        && get_token_result !== null && get_token_result !== undefined ) {
        await queryUpdateOctetAccessToken(get_token_result, db_connection);
    }

    let fee = await octetUtil.octetSelectFee(get_token_result === 'maintain' ? current_access_token['access_token'] : get_token_result);

    let eth = await upBitUtil.upBitSelectCoinPrice('KRW-ETH');


    let fee_won = eth['data'][0]['trade_price'] * fee['data']['fastest'] * process.env.OCTET_GWEI * process.env.OCTET_MAX_GAS_COST;
    let fee_bee_coin = Math.floor(fee_won * 0.1);
    fee['data']['fee_bee_coin'] = fee_bee_coin;

    return fee['data'];

}
