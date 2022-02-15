/**
 * Created by gunucklee on 2022. 02. 15.
 *
 * @swagger
 * /api/private/alert/send/msg/v2:
 *   post:
 *     summary: 알림 메시지 보내기 v2 (FCN 언어 지원 업데이트)
 *     tags: [Alert]
 *     description: |
 *       path : /api/private/alert/send/msg/v2
 *
 *       * 알림 메시지 보내기 v2 (FCN 언어 지원 업데이트)
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
 *             - language
 *           properties:
 *             chat_room_uid:
 *               type: integer
 *               description: |
 *                 채팅방 uid
 *             user_list:
 *               type: string
 *               description: |
 *                 현재 채팅방에 접속 중인 유저 리스트 (해당 유저들에겐 알림 X)
 *             language:
 *               type: string
 *               description: |
 *                 언어 타입
 *
 *           example:
 *             chat_room_uid: 1
 *             user_list: '1,3,5'
 *             language: 'kr'
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

            req.innerBody['fcm_push_token_other_list'] = [];
            let chatRoomUserList = await querySelect(req, db_connection);
            if(chatRoomUserList.length > 0) {
                for (let idx in chatRoomUserList) {
                    chatRoomUserList[idx]['alert_type'] = 0;
                    req.innerBody['fcm_push_token_other_list'].push(chatRoomUserList[idx]['fcm_push_token_other']);
                    await queryCreateAlertHistory(chatRoomUserList[idx], db_connection);
                }

                req.innerBody['fcm_nickname_me'] = chatRoomUserList[0]['fcm_nickname_me'];
                req.innerBody['fcm_filename_me'] = chatRoomUserList[0]['fcm_filename_me'];
                req.innerBody['fcm_target_uid'] = req.paramBody['chat_room_uid'];
                await fcmUtil.fcmMsgArray(req.innerBody);
            }




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
        , 'call proc_select_alert_send_msg_v2'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
          , req.paramBody['user_list']
        ]
    );
}

function queryCreateAlertHistory(item, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_alert_history'
        , [
              item['alert_source_uid']
            , item['alert_target_uid']
            , item['alert_type']
            , item['language'] === 'kr' ? `${item['fcm_nickname_me']}님이 메시지를 보냈습니다.` : `${item['fcm_nickname_me']} sent me a message.`
        ]
    );
}
