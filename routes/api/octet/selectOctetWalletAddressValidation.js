/**
 * Created by gunucklee on 2022. 01. 07.
 *
 * @swagger
 * /api/private/octet/wallet/address/validation:
 *   get:
 *     summary: 옥텟 지갑 유효성 검사
 *     tags: [Octet]
 *     description: |
 *       path : /api/private/octet/wallet/address/validation
 *
 *       * 옥텟 지갑 유효성 검사
 *
 *     parameters:
 *       - in: query
 *         name: toAddress
 *         default: '0xf247267Cf5906A24E21869037D0588A64896A914'
 *         required: true
 *         schema:
 *           type: string
 *           example: '0xf247267Cf5906A24E21869037D0588A64896A914'
 *         description: |
 *           지갑 주소
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

            // 한글 버전
            // req.innerBody['result'] = await octetFunction(req, db_connection) ? "유효한 지갑 주소입니다." : "유효하지 않은 지갑 주소 형식입니다.";
            // 영어 버전
            req.innerBody['result'] = await octetFunction(req, db_connection) ? "This is a valid wallet address." : "This is an invalid wallet address format.";

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
    let address_validation =  await octetUtil.octetSelectAddressValidation(req.paramBody['toAddress']);

    return address_validation['data']['result'];

}
