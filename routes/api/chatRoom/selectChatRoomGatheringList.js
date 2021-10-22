/**
 * Created by gunucklee on 2021. 10. 22.
 *
 * @swagger
 * /api/private/chatRoom/gathering/list:
 *   get:
 *     summary: 근처모임 목록
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/gathering/list
 *
 *       * 근처모임 목록
 *
 *     parameters:
 *       - in: query
 *         name: latitude
 *         default: 37.5662952
 *         required: true
 *         schema:
 *           type: number
 *           example: 37.5662952
 *         description: |
 *           위도
 *       - in: query
 *         name: longitude
 *         default: 127.1039913
 *         required: true
 *         schema:
 *           type: number
 *           example: 127.1039913
 *         description: |
 *           경도
 *       - in: query
 *         name: last_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 0
 *         description: |
 *           목록 마지막 uid (처음일 경우 0)
 *
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

            req.innerBody['item'] = await querySelect(req, db_connection);


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
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'last_uid');
}

function deleteBody(req) {
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_chatRoom_gathering_list'
        , [
            req.paramBody['latitude']
          , req.paramBody['longitude']
          , req.paramBody['last_uid']
        ]
    );
}
