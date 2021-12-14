/**
 * Created by gunucklee on 2021. 12. 14.
 *
 * @swagger
 * /api/public/octet/test:
 *   get:
 *     summary: test
 *     tags: [Octet]
 *     description: |
 *       path : /api/public/octet/test
 *
 *       * test
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
const jwtUtil = require('../../../common/utils/jwtUtil');
const octetUtil = require('../../../common/utils/octetUtil');

const errCode = require('../../../common/define/errCode');

let file_name = fileUtil.name(__filename);

module.exports = function (req, res) {
    const _funcName = arguments.callee.name;

    try {
        req.file_name = file_name;

        req.paramBody = paramUtil.parse(req);

        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};

            req.innerBody['item'] = await query(req, db_connection);

            for (let idx in req.innerBody['item']) {
                await octetFunction(req.innerBody['item'][idx], db_connection);
            }


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


function query(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_test'
        , []
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



function queryUpdateWalletAddress(wallet_address, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_wallet_address'
        , [
              wallet_address['data']['uid']
            , wallet_address['data']['addresses'][0]['address']
        ]
    );
}


async function octetFunction(test, db_connection) {

    let current_access_token = await querySelectOctetAccessToken(test, db_connection);
    console.log("OIWQasdasdasJFOWEIF: " + current_access_token);
    let get_token_result = await octetUtil.octetToken(current_access_token['access_token']);
    console.log("OIWQJFOWEIF: " + get_token_result);
    if( get_token_result !== 'maintain'
        && get_token_result !== null && get_token_result !== undefined ) {
        await queryUpdateOctetAccessToken(get_token_result, db_connection);
    }

    console.log("OIWQJFOWEIasdasdasdasF: " + test['uid']);
    let wallet_address = await octetUtil.octetCreateAddress(test['uid'],
        get_token_result === 'maintain' ? current_access_token['access_token'] : get_token_result);
    wallet_address['data']['uid'] = test['uid'];

    console.log("asdasdasdqwerqq: " + wallet_address['data']['uid'] );
    await queryUpdateWalletAddress(wallet_address, db_connection);

}
