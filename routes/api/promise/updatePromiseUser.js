/**
 * Created by gunucklee on 2021. 10. 06.
 *
 * @swagger
 * /api/private/promise/user:
 *   put:
 *     summary: 약속 상태 변경
 *     tags: [Promise]
 *     description: |
 *       path : /api/private/promise/user
 *
 *       * 약속 상태 변경
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           약속 상태 변경
 *         schema:
 *           type: object
 *           required:
 *             - promise_uid
 *             - status
 *           properties:
 *             promise_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 약속 uid
 *             status:
 *               type: number
 *               example: 1
 *               description: |
 *                 약속 상태
 *                 * 0: 거절
 *                 * 1: 수락함
 *                 * 2: 출발함
 *                 * 3: 만남
 *                 * 4: 취소됨
 *             review:
 *               type: number
 *               example: 0
 *               description: |
 *                 후기
 *                 * 0: 좋았다
 *                 * 1: 잘 모르겠다
 *                 * 2: 별로다
 *             hate_reason:
 *               type: number
 *               example: 0
 *               description: |
 *                 별로인 이유
 *                 * 0: 성격이 잘 안 맞는 거 같아요.
 *                 * 1: 외모가 제 타입이 아니에요 ㅠ
 *                 * 2: 대화가 잘 안 통했어요
 *                 * 3: 기타
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

            req.innerBody['item'] = await queryUpdate(req, db_connection);

            // 채팅 룸을 삭제와 해당 유저 차단
            if(req.paramBody['review'] === 2) {
                let check = await queryBlockCheck(req, db_connection);

                if(!check) {
                    await queryCreateBlockUser(req, db_connection);
                }
                req.innerBody['success'] = '해당 유저 차단을 완료했습니다.';
            }

            switch (req.paramBody['status']){

                // 주최자 외에 모든 사람이 거절한다면 꿀을 환불 해주어야 함
                case 0: {
                    let check = await queryPromiseEnterCheck(req, db_connection);
                    paramUtil.checkParam_alreadyUse(check,'이미 해당 약속에 참여했기 때문에 거절을 수행할 수 없습니다.');

                    await queryCreatePromiseRefuse(req, db_connection);

                    let user = await queryPromiseRefuseCheck(req, db_connection);
                    if(user) {
                        req.innerBody['manual_code'] = 'H2-001';
                        let system_honey = await querySelect(req, db_connection);
                        user['honey_amount'] = system_honey['honey_amount'];
                        user['type'] = 20; // type 20: 약속 거절 환불
                        user['content'] = system_honey['title'];
                        await queryCreate(user, db_connection);

                        user['promise_uid'] = req.paramBody['promise_uid'];
                        await queryDeletePromise(user, db_connection);

                        req.innerBody['success'] = '환불 꿀이 지급되었습니다.';
                    }
                } break;

                // 모두가 만남이 성사된다면 꿀을 지급해주어야 함
                case 3: {
                    let price_user_list = await queryMeetSuccessCheck(req, db_connection);

                    if(price_user_list) {

                        req.innerBody['manual_code'] = 'H0-003';
                        let system_honey = await querySelect(req, db_connection);

                        for (let idx in price_user_list) {
                            price_user_list[idx]['honey_amount'] = system_honey['honey_amount'];
                            price_user_list[idx]['type'] = 12; // type 12: 만남 인증 무료
                            price_user_list[idx]['content'] = system_honey['title'];
                            await queryCreate(price_user_list[idx], db_connection);
                        }

                        req.innerBody['success'] = '만남 꿀이 지급되었습니다.';

                    }
                } break;
                default: break;
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
    paramUtil.checkParam_noReturn(req.paramBody, 'promise_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'status');
}

function deleteBody(req) {
}


function queryBlockCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_block_user_check'
        , [
            req.headers['user_uid']
          , req.innerBody['item']['other_user_uid']
        ]
    );
}

function queryPromiseRefuseCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_promise_refuse_check'
        , [
            req.paramBody['promise_uid']
        ]
    );
}


function queryMeetSuccessCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_meet_success_check'
        , [
            req.paramBody['promise_uid']
        ]
    );
}



function queryPromiseEnterCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_promise_enter_check'
        , [
            req.headers['user_uid']
            , req.paramBody['promise_uid']
        ]
    );
}


function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honey_system'
        , [
            req.innerBody['manual_code']
        ]
    );
}


function queryCreate(user, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_honeyHistory'
        , [
              user['user_uid']
            , user['type']
            , 0   // payment
            , user['honey_amount']
            , user['content']
        ]
    );
}


function queryCreatePromiseRefuse(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_promise_refuse'
        , [
              req.headers['user_uid']
            , req.paramBody['promise_uid']
        ]
    );
}



function queryCreateBlockUser(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_block_user'
        , [
            req.headers['user_uid']
          , req.innerBody['item']['other_user_uid']
        ]
    );
}



function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_promise_user'
        , [
            req.headers['user_uid']
          , req.paramBody['promise_uid']
          , req.paramBody['status']
          , req.paramBody['review']
          , req.paramBody['hate_reason']
        ]
    );
}

function queryDeletePromise(user, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_promise'
        , [
              user['user_uid']
            , user['promise_uid']
        ]
    );
}