/**
 * Created by gunucklee on 2021. 11. 09.
 *
 * @swagger
 * /api/private/chatRoom/user/chatReadTime:
 *   put:
 *     summary: 채팅 읽은 시간 업데이트
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/user/chatReadTime:
 *
 *       * 채팅 읽은 시간 업데이트
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           최근 메시지 업데이트
 *         schema:
 *           type: object
 *           required:
 *             - chat_room_uid
 *           properties:
 *             chat_room_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 채팅방 uid
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

    try{
        req.file_name = file_name;
        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};

            await queryUpdate(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'chat_room_uid');
}

function deleteBody(req) {
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_chat_read_time'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
        ]
    );
}
