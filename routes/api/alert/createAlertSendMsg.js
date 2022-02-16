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
 *             user_list:
 *               type: string
 *               description: |
 *                 현재 채팅방에 접속 중인 유저 리스트 (해당 유저들에겐 알림 X)
 *
 *           example:
 *             chat_room_uid: 1
 *             user_list: '1,3,5'
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

            await fcmFunction(req, db_connection);

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
            , item['message']
        ]
    );
}

// 왜 동작안하는지 파악해야 함.
async function fcmFunction(req, db_connection) {

    let herbee_language_list = process.env.HERBEE_LANGUAGE_TYPES.split(',');

    console.log('asdfsafsdfsfs: ' + JSON.stringify(herbee_language_list ));
    let chatRoomUserList = await querySelect(req, db_connection);

    req.innerBody['fcm_nickname_me'] = chatRoomUserList[0]['fcm_nickname_me'];
    req.innerBody['fcm_filename_me'] = chatRoomUserList[0]['fcm_filename_me'];
    req.innerBody['fcm_target_uid'] = req.paramBody['chat_room_uid'];

    for (let idx in herbee_language_list) {
        console.log('asdfsafsdfsfs: ' + herbee_language_list['idx'] );
        req.innerBody['fcm_push_token_other_list'] = [];

        for(let idx in chatRoomUserList) {
            console.log('123121111: ' + herbee_language_list[idx]);
            console.log('123121111: ' + chatRoomUserList[idx]['fcm_language_other']);
            console.log('wdasdasasda:' + herbee_language_list[idx] == chatRoomUserList[idx]['fcm_language_other']);

            if(herbee_language_list[idx] == chatRoomUserList[idx]['fcm_language_other']) {
                req.innerBody['fcm_push_token_other_list'].push(chatRoomUserList[idx]['fcm_push_token_other']);

                switch (chatRoomUserList[idx]['fcm_language_other']) {
                    case 'ko':
                        req.innerBody['title'] = `메시지 알림`;
                        req.innerBody['message'] = `${req.innerBody['fcm_nickname_me']}님이 메시지를 보냈습니다.`;
                        req.innerBody['channel'] = `메시지`;
                        chatRoomUserList[idx]['message'] = req.innerBody['message'];
                        break;
                    case 'en':
                        req.innerBody['title'] = "message notification";
                        req.innerBody['message'] = `${req.innerBody['fcm_nickname_me']} sent me a message.`;
                        req.innerBody['channel'] = `message`;
                        chatRoomUserList[idx]['message'] = req.innerBody['message'];
                        break;
                }
                await queryCreateAlertHistory(chatRoomUserList[idx], db_connection);
            }
        }

        await fcmUtil.fcmMsgArray(req.innerBody);
    }
}
