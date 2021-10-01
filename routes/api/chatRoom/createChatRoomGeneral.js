/**
 * Created by gunucklee on 2021. 09. 28.
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
 *             - request_msg_type
 *             - chat_room_user_list
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
 *           example:
 *             target_uid: 1
 *             type: 0
 *             content: 라이프 스타일 테스트 댓글 입니다.
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
const fcmUtil = require('../../../common/utils/fcmUtil');;

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

            let check = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(check,'이미 해당 채팅방이 등록되어 있습니다.');

            req.innerBody['item'] = await queryCreateChatRoom(req, db_connection);

            for (let idx in req.paramBody['chat_room_user_list']) {
                req.innerBody['user'] = req.paramBody['chat_room_user_list'][idx];
                await queryCreateChatRoomUser(req, db_connection);

            }

            // FCM 기능 추후 반영 예정
            // if(req.headers['user_uid'] !== req.innerBody['item']['video_user_uid'])
            //     await fcmUtil.fcmVideoCommentSingle(req.innerBody['item'])

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
    paramUtil.checkParam_noReturn(req.paramBody, 'target_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'content');
}

function deleteBody(req) {
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
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['content']
        ]
    );
}


function queryCreateChatRoomUser(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_chatRoom_user'
        , [
            req.headers['user_uid']
            , req.paramBody['target_uid']
            , req.paramBody['type']
            , req.paramBody['content']
        ]
    );
}


