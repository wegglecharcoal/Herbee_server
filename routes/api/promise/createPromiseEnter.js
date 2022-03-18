/**
 * Created by gunucklee on 2021. 10. 06.
 *
 * @swagger 
 * /api/private/promise/enter:
 *   post:
 *     summary: 약속 참여
 *     tags: [Promise]
 *     description: |
 *       path : /api/private/promise/enter
 *
 *       * 약속 참여
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           약속 하기
 *         schema:
 *           type: object
 *           required:
 *             - promise_uid
 *           properties:
 *             promise_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 약속 uid
 *
 *
 *     responses:
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
const fcmUtil = require("../../../common/utils/fcmUtil");
const errCode = require("../../../common/define/errCode");

let file_name = fileUtil.name(__filename);

const HOUR_MILLI = 3600000;
module.exports = function (req, res) {
    const _funcName = arguments.callee.name;

    try {
        req.file_name = file_name;
        logUtil.printUrlLog(req, `== function start ==================================`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};

            let check = await queryCheck(req, db_connection);

            paramUtil.checkParam_alreadyUse(check, errCode.already_promise_enter,'Error code: 507 [이미 해당 약속에 참여했습니다.]');

            req.innerBody['item'] = await queryCreate(req, db_connection);

            req.innerBody['item']['alert_type'] = 11;
            await fcmFunction(req, db_connection);

            let promise_milli = new Date(req.innerBody['item']['promise_date']).getTime();
            let now_milli = new Date().getTime();
            let gap_milli = promise_milli - now_milli - HOUR_MILLI;

            // 약속 한 시간 전 리마인드 FCM 알림
            setTimeout(  async function() {
                req.innerBody['item']['alert_type'] = 12;
                await fcmFunction(req, db_connection);
            }, gap_milli);

            // deleteBody(req);
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });
    }
    catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}

function deleteBody(req) {
    delete req.innerBody['item']['fcm_push_token_me'];
    delete req.innerBody['item']['fcm_nickname_me'];
    delete req.innerBody['item']['fcm_filename_me'];
    delete req.innerBody['item']['fcm_push_token_other'];
    delete req.innerBody['item']['fcm_nickname_other'];
    delete req.innerBody['item']['fcm_filename_other'];
    delete req.innerBody['item']['fcm_target_uid'];
    delete req.innerBody['item']['alert_source_uid'];
    delete req.innerBody['item']['alert_target_uid'];
    delete req.innerBody['item']['alert_type'];
}


function checkParam(req) {
    paramUtil.checkParam_noReturn(req.paramBody, 'promise_uid');
}



function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_promise_enter_check'
        , [
            req.headers['user_uid']
          , req.paramBody['promise_uid']
        ]
    );
}

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_promise_enter'
        , [
            req.headers['user_uid']
          , req.paramBody['promise_uid']
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
            , item['fcm_message']
        ]
    );
}

async function fcmFunction(req, db_connection) {

    let herbee_language_list = process.env.HERBEE_LANGUAGE_TYPES.split(',');

    for (let i in herbee_language_list) {
        if (herbee_language_list[i] == req.innerBody['item']['fcm_language_other']) {
            switch (req.innerBody['item']['fcm_language_other']) {
                case 'ko':
                    req.innerBody['item']['fcm_title'] = (req.innerBody['item']['alert_type'] == 11) ?
                                                            `약속 수락 알림` : '약속 한 시간 전 알림';
                    req.innerBody['item']['fcm_message'] = (req.innerBody['item']['alert_type'] == 11) ?
                                                            `${req.innerBody['item']['fcm_nickname_me']}님이 약속을 수락했습니다.` : `${req.innerBody['item']['fcm_nickname_other']}님과의 약속 잊지 않으셨죠? 출발할 때 알려주세요.`;
                    req.innerBody['item']['fcm_channel'] = `약속`;
                    break;
                case 'en':
                    req.innerBody['item']['fcm_title'] = (req.innerBody['item']['alert_type'] == 11) ?
                                                            "accepted the promise notification" : "an hour before the promise notification";
                    req.innerBody['item']['fcm_message'] = (req.innerBody['item']['alert_type'] == 11) ?
                                                            `${req.innerBody['item']['fcm_nickname_me']} accepted the promise.` : `You didn't forget your promise with ${req.innerBody['item']['fcm_nickname_other']}, right? Please let me know when you leave.`;
                    req.innerBody['item']['fcm_channel'] = `promise`;
                    break;
            }
        }

    }

    if(req.innerBody['item']['alert_type'] == 12) {
        req.innerBody['item']['alert_target_uid'] = req.innerBody['item']['alert_source_uid'];
        req.innerBody['item']['alert_source_uid'] = req.headers['user_uid'];
        await fcmUtil.fcmPromiseAfterAnHourSingle(req.innerBody['item']);
    }
    else {
        await fcmUtil.fcmPromiseAcceptSingle(req.innerBody['item']);
    }

    await queryCreateAlertHistory(req.innerBody['item'], db_connection);

}