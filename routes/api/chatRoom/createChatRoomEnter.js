/**
 * Created by gunucklee on 2021. 10. 05.
 *
 * @swagger
 * /api/private/chatRoom/enter:
 *   post:
 *     summary: 모임 채팅방 참여
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/enter
 *
 *       * 모임 채팅방 참여
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           모임 채팅방 참여
 *         schema:
 *           type: object
 *           required:
 *             - chat_room_uid
 *           properties:
 *             chat_room_uid:
 *               type: integer
 *               description: |
 *                 모임 채팅방 uid
 *
 *           example:
 *             chat_room_uid: 1
 *
 *     responses:
 *       200:
 *         description: 결과 정보
 */
const paramUtil = require('../../../common/utils/paramUtil');
const fileUtil = require('../../../common/utils/fileUtil');
const mysqlUtil = require('../../../common/utils/mysqlUtil');
const sendUtil = require('../../../common/utils/sendUtil');
const errUtil = require('../../../common/utils/errUtil');
const logUtil = require('../../../common/utils/logUtil');

const errCode = require('../../../common/define/errCode');


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

            req.innerBody['item'] = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(req.innerBody['item'], '이미 참여한 채팅방입니다.');

            req.innerBody['item'] = await queryCreate(req, db_connection);

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

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_chatRoom_enter'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
        ]
    );
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_user_check'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
          , 0        // is_head      {0: false, 1: true}
        ]
    );
}

