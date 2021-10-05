/**
 * Created by gunucklee on 2021. 10. 05.
 *
 * @swagger
 * /api/private/chatRoom/user/list:
 *   get:
 *     summary: 채팅방 유저 목록
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/user/list
 *
 *       * 채팅방 유저 목록
 *
 *     parameters:
 *       - in: query
 *         name: chat_room_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: |
 *           채팅방 uid
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


            deleteBody(req)
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
    paramUtil.checkParam_noReturn(req.paramBody, 'chat_room_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'last_uid');
}

function deleteBody(req) {
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_chatRoom_user_list'
        , [
            req.paramBody['chat_room_uid']
          , req.paramBody['last_uid']
        ]
    );
}

