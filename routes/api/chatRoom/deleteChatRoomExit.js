/**
 * Created by gunucklee on 2021. 10. 05.
 *
 * @swagger
 * /api/private/chatRoom/exit:
 *   delete:
 *     summary: 모임 채팅방 나가기
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/exit
 *
 *       * 모임 채팅방 나가기
 *
 *     parameters:
 *       - in: query
 *         name: chat_room_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 모임 채팅방 uid
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

            req.innerBody['item'] = await queryCheckUser(req, db_connection);
            if (!req.innerBody['item']) {
                // 한글 버전
                // errUtil.createCall(errCode.empty, `참여하지 않은 채팅방입니다.`);
                // 영어 버전
                errUtil.createCall(errCode.empty, `The chat room that i didn't participate in.`);
                return;
            }

            req.innerBody['item'] = await queryCheckIsHead(req, db_connection);

            if (req.innerBody['item']) {
                // 한글 버전
                // errUtil.createCall(errCode.fail, `다른 유저가 방에 있습니다. 모임 채팅방은 방장이 혼자 있을 때만 나갈 수 있습니다.`);
                // 영어 버전
                errUtil.createCall(errCode.fail, `Another user is in the room. You can only go out of the gathering chat room when the room manager is alone.`);
                return;
            }



            await queryDelete(req, db_connection);
            // 한글 버전
            // req.innerBody['success'] = '채팅방에서 나갔습니다.';
            // 영어 버전
            req.innerBody['success'] = 'left the chat room.';

            deleteBody(req)
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
    delete req.innerBody['item']
}


function queryCheckUser(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_user_all_check'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
        ]
    );
}


function queryCheckIsHead(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_user_check'
        , [
              req.headers['user_uid']
            , req.paramBody['chat_room_uid']
            , 1    // is_head      {0: false, 1: true}
        ]
    );
}


function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_chatRoom_exit'
        , [
              req.headers['user_uid']
            , req.paramBody['chat_room_uid']
        ]
    );
}
