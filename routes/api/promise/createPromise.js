/**
 * Created by gunucklee on 2021. 10. 19.
 *
 * @swagger 
 * /api/private/promise:
 *   post:
 *     summary: 약속 하기  * 추가 헤더
 *     tags: [Promise]
 *     description: |
 *       path : /api/private/promise
 *       * 추가 헤더: Manual_code = "H1-002"
 *       * 필요한 꿀 갯수 = 5개
 *
 *       * 약속 하기
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           약속 하기
 *         schema:
 *           type: object
 *           required:
 *             - chat_room_uid
 *             - promise_date
 *             - address
 *             - latitude
 *             - longitude
 *           properties:
 *             chat_room_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 채팅방 uid
 *             promise_date:
 *               type: string
 *               example: '2021-09-06 10:22:33'
 *               description: |
 *                 약속 일자
 *             address:
 *               type: string
 *               example: '부산광역시 부산진구 부전3동 중앙대로 672'
 *               description: |
 *                 주소
 *             building_name:
 *               type: string
 *               example: '삼정타워'
 *               description: |
 *                 주소
 *             latitude:
 *               type: number
 *               example: 37.5662952
 *               description: |
 *                 위도
 *             longitude:
 *               type: number
 *               example: 126.9773966
 *               description: |
 *                 경도
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

const fcmUtil = require('../../../common/utils/fcmUtil');

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

            req.innerBody['item'] = await queryCreate(req, db_connection);

            await fcmFunction(req, db_connection);

            deleteBody(req);

            await queryCreateUseHoney(req, db_connection);

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
    for (let idx in req.innerBody['item']) {
        delete req.innerBody['item'][idx]['fcm_target_uid'];
        delete req.innerBody['item'][idx]['fcm_filename_me'];
        delete req.innerBody['item'][idx]['fcm_push_token_other'];
        delete req.innerBody['item'][idx]['alert_source_uid'];
        delete req.innerBody['item'][idx]['alert_target_uid'];
    }
    delete req.innerBody['item']['fcm_nickname_me'];
    delete req.innerBody['item']['fcm_filename_me'];
    delete req.innerBody['item']['fcm_push_token_other'];
    delete req.innerBody['item']['fcm_target_uid'];
    delete req.innerBody['item']['alert_source_uid'];
    delete req.innerBody['item']['alert_target_uid'];
    delete req.innerBody['item']['alert_type'];
    delete req.innerBody['item']['fcm_title'];
    delete req.innerBody['item']['fcm_message'];
    delete req.innerBody['item']['fcm_channel'];

}

function checkParam(req) {
    paramUtil.checkParam_noReturn(req.paramBody, 'chat_room_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'promise_date');
    paramUtil.checkParam_noReturn(req.paramBody, 'address');
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');
}


function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_create_promise'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
          , req.paramBody['promise_date']
          , req.paramBody['address']
          , req.paramBody['building_name']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
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

    req.innerBody['item']['fcm_nickname_me'] = req.innerBody['item'][0]['fcm_nickname_me'];
    req.innerBody['item']['fcm_filename_me'] = req.innerBody['item'][0]['fcm_filename_me'];
    req.innerBody['item']['fcm_target_uid'] = req.innerBody['item'][0]['fcm_target_uid'];

    for (let i in herbee_language_list) {
        req.innerBody['item']['fcm_push_token_other_list'] = [];

        for(let idx in req.innerBody['item']) {
            if(herbee_language_list[i] == req.innerBody['item'][idx]['fcm_language_other']) {
                req.innerBody['item']['fcm_push_token_other_list'].push(req.innerBody['item'][idx]['fcm_push_token_other']);

                switch (req.innerBody['item'][idx]['fcm_language_other']) {
                    case 'ko':
                        req.innerBody['item']['fcm_title'] = `약속 생성 알림`;
                        req.innerBody['item']['fcm_message'] = `${req.innerBody['item'][idx]['fcm_nickname_me']}님이 약속을 잡았습니다.`;
                        req.innerBody['item']['fcm_channel'] = `약속`;
                        break;
                    case 'en':
                        req.innerBody['item']['fcm_title'] = "made an promise notification";
                        req.innerBody['item']['fcm_message'] = `${req.innerBody['item'][idx]['fcm_nickname_me']} made an promise.`;
                        req.innerBody['item']['fcm_channel'] = `promise`;
                        break;
                }

                if( req.innerBody['item'][idx]['source_uid'] === req.innerBody['item'][idx]['target_uid'] ) {
                    req.innerBody['item'][idx]['alert_type'] = 10;
                    await queryCreateAlertHistory(req.innerBody['item'][idx], db_connection);
                }
            }
        }
        await fcmUtil.fcmPromiseCreateArray(req.innerBody['item']);
    }

}