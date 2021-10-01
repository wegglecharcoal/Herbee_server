/**
 * Created by gunucklee on 2021. 09. 28.
 *
 * @swagger
 * /api/private/Promise:
 *   post:
 *     summary: 약속 하기
 *     tags: [Promise]
 *     description: |
 *       path : /api/private/Promise
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
 *             - building_name
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
 *             filename:
 *               type: string
 *               example: 'fem2wefwmpeofmwef.jpg'
 *               description: |
 *                 신고 이미지
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

            let check = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(check,'이미 해당 신고가 등록되어 있습니다.');

            req.innerBody['item'] = await queryCreate(req, db_connection);

            deleteBody(req);
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
}

function checkParam(req) {
    paramUtil.checkParam_noReturn(req.paramBody, 'target_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'status');
}


function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_report_check'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['status']
        ]
    );
}


function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_report'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['status']
          , req.paramBody['report_reason']
          , req.paramBody['filename']
        ]
    );
}
