/**
 * Created by gunucklee on 2021. 12. 08.
 *
 * @swagger
 * /api/private/alert/send/msg:
 *   post:
 *     summary: 알림 메시지 보내기
 *     tags: [Alert]
 *     description: |
 *       path : /api/private/alert/send/msg
 *
 *       * 알림 메시지 보내기
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
 *                 채팅방 uid
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
const fcmUtil = require('../../../common/utils/fcmUtil');

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

            req.innerBody['fcm_push_token_list'] = [];
            let chatRoomUserList = await querySelect(req, db_connection);
            for (let idx in chatRoomUserList) {
                req.innerBody['fcm_push_token_list'].push(chatRoomUserList[idx]['fcm_push_token']);
            }

            req.innerBody['fcm_nickname'] = chatRoomUserList[0]['fcm_nickname'];
            req.innerBody['fcm_filename'] = chatRoomUserList[0]['fcm_filename'];

            await fcmUtil.fcmMsgArray(req.innerBody);

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

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_alert_send_msg'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
        ]
    );
}
