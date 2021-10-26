/**
 * Created by gunucklee on 2021. 10. 12.
 *
 * @swagger
 * /api/private/chatRoom/retry:
 *   put:
 *     summary: 다시 대화하기
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/retry
 *
 *       * 다시 대화하기
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           다시 대화하기
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
const errCode = require("../../../common/define/errCode");

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

            // 기존에 있는지 없는지 판단
            // 3회가 안넘었는지 판단해준다.
            // 10꿀 차감

            let chatRoomCheck = await queryCheckChatRoom(req, db_connection);
            if (!chatRoomCheck) {
                errUtil.createCall(errCode.fail, `존재하지 않는 채팅방입니다. 확인 후 다시 시도해주세요.`);
                return;
            }

            let retryCheck = await queryCheckRetry(req, db_connection);
            if (!retryCheck) {
                errUtil.createCall(errCode.fail, `다시 대화하기 시도 횟수가 넘었습니다. 다시 대화하기는 최대 3회만 가능합니다.`);
                return;
            }

            req.innerBody['item'] = await queryUpdate(req, db_connection);

            deleteBody(req);
            await queryCreateUseHoney(req, db_connection);
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

function queryCheckChatRoom(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_user_all_check'
        , [
            req.headers['user_uid']
            , req.paramBody['chat_room_uid']
        ]
    );
}


function queryCheckRetry(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_retry_check'
        , [
            req.headers['user_uid']
            , req.paramBody['chat_room_uid']
        ]
    );
}



function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_chatroom_retry'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
        ]
    );
}

function queryCreateUseHoney(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_use_honey'
        , [
            req.headers['user_uid']
            , req.headers['manual_code']
        ]
    );
}
