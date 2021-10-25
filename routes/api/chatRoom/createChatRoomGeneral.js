/**
 * Created by gunucklee on 2021. 10. 01.
 *
 * @swagger
 * /api/private/chatRoom/general:
 *   post:
 *     summary: 일반 채팅방 생성
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/general
 *
 *       * 일반 채팅방 생성
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           일반 채팅방 생성
 *         schema:
 *           type: object
 *           required:
 *           properties:
 *             request_msg_type:
 *               type: number
 *               example: 3
 *               description: |
 *                 채팅 신청 메시지 타입
 *                 * 0: 저랑 잘 맞으실 거 같아요
 *                 * 1: 대화해 보고 싶어요
 *                 * 2: 친해지고 싶어요
 *                 * 3: 직접입력
 *             request_msg:
 *               type: number
 *               example: 안녕하세요 처음 메시지 보내서 응애~~~~~!!!
 *               description: |
 *                 채팅 신청 메시지
 *                 request_msg_type == 3
 *                 직접 입력일 때 값이 들어갑니다.
 *             chat_room_user_list:
 *               type: array
 *               description: 채팅방 유저 리스트
 *               items:
 *                 type: object
 *                 properties:
 *                   user_uid:
 *                     type: number
 *                     example: 1
 *                     description: |
 *                       유저 uid
 *                   is_head:
 *                     type: number
 *                     example: 1
 *                     description: |
 *                       방장 여부
 *
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

let file_name = fileUtil.name(__filename);

module.exports = function (req, res, next) {
    const _funcName = arguments.callee.name;

    try{
        req.file_name = file_name;
        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};

            // let check = await queryCheck(req, db_connection);
            // paramUtil.checkParam_alreadyUse(check,'이미 해당 채팅방이 등록되어 있습니다.');

            req.innerBody['item'] = await queryCreateChatRoom(req, db_connection);

            req.innerBody['user_list'] = [];

            for (let idx in req.paramBody['chat_room_user_list']) {
                req.innerBody['user'] = req.paramBody['chat_room_user_list'][idx];
                let user = await queryCreateChatRoomUser(req, db_connection);

                req.innerBody['user_list'].push(user);

            }

            // FCM 기능 추후 반영 예정
            // if(req.headers['user_uid'] !== req.innerBody['item']['video_user_uid'])
            //     await fcmUtil.fcmVideoCommentSingle(req.innerBody['item'])

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
    paramUtil.checkParam_noReturn(req.paramBody, 'request_msg_type');
    paramUtil.checkParam_noReturn(req.paramBody, 'chat_room_user_list');
}

function deleteBody(req) {
    delete req.innerBody['user']
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_general_check'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['content']
        ]
    );
}



function queryCreateChatRoom(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_chatRoom_general'
        , [
            0                       // 채팅방 타입 0: 일반채팅
          , req.paramBody['request_msg_type']
          , req.paramBody['request_msg']
        ]
    );
}


function queryCreateChatRoomUser(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_chatRoom_user'
        , [
              req.innerBody['item']['uid']
            , req.innerBody['user']['user_uid']
            , req.innerBody['user']['is_head']
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
