/**
 * Created by gunucklee on 2021. 10. 26.
 *
 * @swagger
 * /api/private/chatRoom/retry:
 *   delete:
 *     summary: 다시 대화하기 거절하기
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/retry
 *
 *       * 다시 대화하기 거절하기
 *       거절한다고 해서 채팅방이 삭제되지는 않습니다.
 *       Retry 횟수는 최대 3회이며
 *       3회를 초과하게 되면 채팅방이 자동으로 삭제됩니다.
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
            let check = await queryCheckUser(req, db_connection);
            if (!check) {
                // 한글 버전
                // errUtil.createCall(errCode.empty, `참여하지 않은 채팅방입니다.`);
                // 영어 버전
                errUtil.createCall(errCode.empty, `This is the chat room that I didn't participate in.`);
                return;
            }

            req.innerBody['item'] = await queryDelete(req, db_connection);

            // 한글 버전
            // req.innerBody['success'] = '다시 대화하기를 거절했습니다.';
            // 영어버전
            req.innerBody['success'] = 'refused to chat again';

            req.innerBody['manual_code'] = 'H2-002';
            let refund_honey = await querySelectHoneySystem(req, db_connection);
            refund_honey['user_uid'] = req.headers['user_uid'];
            await queryRefundHoney(refund_honey, db_connection);

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

function querySelectHoneySystem(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honey_system'
        , [
            req.innerBody['manual_code']
        ]
    );
}

function queryRefundHoney(refund_honey, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_honeyHistory'
        , [
            refund_honey['user_uid']
            , 21  // type => 21: 채팅 제안 거절 환불
            , 0   // payment
            , refund_honey['honey_amount']
            , refund_honey['content']
        ]
    );
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


function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_chatroom_retry'
        , [
             req.paramBody['chat_room_uid']
        ]
    );
}
