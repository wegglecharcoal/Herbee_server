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

            if(req.paramBody['review'] === 2) {
                // 채팅 룸을 삭제시켜주어야함.
                await queryDelete(req, db_connection);
                req.innerBody['success'] = '채팅방에서 나갔습니다.';
            }


            if(req.paramBody['status'] === 3) {
                // 모두가 만남이 성사된다면 꿀을 지급해주어야 함
                req.innerBody['manual_code'] = 'H0-003';
                let system_honey = await querySelect(req, db_connection);

                req.innerBody['honey_amount'] = system_honey['honey_amount'];;
                await queryCreate(req, db_connection);
                req.innerBody['success'] = '꿀이 지급되었습니다.';
            }

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
    paramUtil.checkParam_noReturn(req.paramBody, 'promise_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'status');
}

function deleteBody(req) {
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


function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_honeyHistory'
        , [
            req.headers['user_uid']
            , 12  // type => 12: 만남인증 무료
            , 0   // payment
            , req.innerBody['honey_amount']
            , req.innerBody['content']
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

function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_chatRoom'
        , [
            req.innerBody['item']['chat_room_uid']
        ]
    );
}