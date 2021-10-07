/**
 * Created by gunucklee on 2021. 10. 05.
 *
 * @swagger
 * /api/private/chatRoom:
 *   delete:
 *     summary: 채팅방 삭제
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom
 *
 *       * 채팅방 삭제
 *       * type ==== 1 일 때 해당 api 호출 전 필수 사항
 *         1. /api/private/chatRoom/head 다른 유저에게 방장권한 위임
 *         2. /api/private/chatRoom/exit 모임 채팅방 나가기
 *         or
 *         1. 해당 chat_room_uid 에 속하는 chat_room_user 들이 전부 deleted_time 존재해야지 작동될 수 있습니다.
 *
 *     parameters:
 *       - in: query
 *         name: type
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: |
 *           삭제 타입
 *           * 0: 일반 채팅방 삭제
 *           * 1: 모임 채팅방 삭제
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
                errUtil.createCall(errCode.empty, `참여하지 않은 채팅방입니다.`);
                return;
            }


            // 모임일 때
            if( req.paramBody['type'] === '1' ) {

                let isHead = await queryCheckIsHead(req, db_connection);

                if (!isHead) {
                    errUtil.createCall(errCode.fail, `방장 권한이 없습니다. 확인 후 다시 시도해주세요.`);
                    return;
                }

                let isAlone = await queryCheckIsAlone(req, db_connection);

                if (isAlone['is_alone'] !== 1) {
                    errUtil.createCall(errCode.fail, `모임 채팅방은 혼자 있을 경우에만 채팅방에서 나갈 수 있습니다.`);
                    return;
                }


                await queryDelete(req, db_connection);
            }

            await queryDelete(req, db_connection);
            req.innerBody['success'] = '채팅방에서 나갔습니다.';

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
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
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


function queryCheckIsAlone(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_user_is_alone_check'
        , [
            req.paramBody['chat_room_uid']
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
        , 'call proc_delete_chatRoom'
        , [
             req.paramBody['chat_room_uid']
        ]
    );
}
