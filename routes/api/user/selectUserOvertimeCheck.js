/**
 * Created by gunucklee on 2021. 01. 02.
 *
 * @swagger
 * /api/private/user/overtime/check:
 *   get:
 *     summary: 유저 시간초과 체크
 *     tags: [User]
 *     description: |
 *       path : /api/private/user/me
 *
 *       * 유저 시간초과 체크
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

    try {
        req.file_name = file_name;
        logUtil.printUrlLog(req, `== function start ==================================`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};

            // 약속 제안 자동 취소 환불 (6시간 안에 수락 안하면 자동 전액 환불)
            let overtimePromiseList = await queryCheckPromiseAccept(req, db_connection);

            if (overtimePromiseList) {

                for(let idx in overtimePromiseList) {

                    req.innerBody['item']['chat_room_uid'] = overtimePromiseList[idx]['uid'];
                    await queryDeletePromise(req, db_connection);

                    req.innerBody['manual_code'] = 'H2-003';
                    let refund_honey = await querySelectHoneySystem(req, db_connection);

                    refund_honey['user_uid'] = req.headers['user_uid'];
                    refund_honey['type'] = 22; // type 22: 약속 제안 자동 취소 환불 (6시간 안에 수락 안하면 자동 전액 환불)
                    await queryRefundHoney(refund_honey, db_connection);

                }

            }

            // 채팅 제안 자동 취소 환불 (3일 안에 수락 안하면 자동 전액 환불)
            let overtimeChatRoomList = await queryCheckChatRoom(req, db_connection);

            if (overtimeChatRoomList) {

                for(let idx in overtimeChatRoomList) {

                    req.innerBody['item']['promise_uid'] = overtimeChatRoomList[idx]['uid'];
                    await queryDeletePromise(req, db_connection);

                    req.innerBody['manual_code'] = 'H2-004';
                    let refund_honey = await querySelectHoneySystem(req, db_connection);

                    refund_honey['user_uid'] = req.headers['user_uid'];
                    refund_honey['type'] = 23; // type 23: 채팅 제안 자동 취소 환불 (3일 안에 수락 안하면 자동 전액 환불)
                    await queryRefundHoney(refund_honey, db_connection);
                }

            }

            // promise date 약속 시간 이후로 30분 만남을 하지 못했다면 (환불X 취소만)
            let overtimePromises = await queryCheckPromiseMeet(req, db_connection);

            if(overtimePromises) {
                for(let idx in overtimePromises) {

                    req.innerBody['item']['promise_uid'] = overtimePromises[idx]['uid'];
                    await queryDeletePromise(req, db_connection);

                }
            }

            deleteBody(req);
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });



    } catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}


function checkParam(req) {
}

function deleteBody(req) {
}

function queryCheckPromiseAccept(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_user_overtime_promise_accept_check'
        , [
            req.headers['user_uid']
        ]
    );

}

function queryCheckPromiseMeet(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_overtime_promise_meet_check'
        , [
            req.headers['user_uid']
        ]
    );

}

function queryCheckChatRoom(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_overtime_chatRoom_check'
        , [
            req.headers['user_uid']
        ]
    );

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
            , refund_honey['type']
            , 0   // payment
            , refund_honey['honey_amount']
            , refund_honey['content']
        ]
    );
}


function queryDeletePromise(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_promise'
        , [
            req.headers['user_uid']
            , req.innerBody['item']['promise_uid']
        ]
    );
}
