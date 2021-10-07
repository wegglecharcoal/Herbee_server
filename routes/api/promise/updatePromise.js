/**
 * Created by gunucklee on 2021. 10. 07.
 *
 * @swagger
 * /api/private/promise:
 *   put:
 *     summary: 약속 변경 (장소, 날짜)
 *     tags: [Promise]
 *     description: |
 *       path : /api/private/promise
 *
 *       * 약속 변경 (장소, 날짜)
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
 *             - promise_date
 *             - address
 *             - building_name
 *             - latitude
 *             - longitude
 *           properties:
 *             promise_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 약속 uid
 *             promise_date:
 *               type: string
 *               example: 2021-09-06 10:22:33
 *               description: |
 *                 약속 날짜
 *             address:
 *               type: string
 *               example: 부산광역시 부산진구 부전 2동 중앙대로 672
 *               description: |
 *                 주소
 *             building_name:
 *               type: string
 *               example: '삼정타워'
 *               description: |
 *                 빌딩 이름
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
const errCode = require("../../../common/define/errCode");

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
            if (!check) {
                errUtil.createCall(errCode.fail, `약속 주최자만 약속을 변경할 수 있는 권한이 주어집니다.`);
                return;
            }


            req.innerBody['item'] = await queryUpdate(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'address');
    paramUtil.checkParam_noReturn(req.paramBody, 'promise_date');
    paramUtil.checkParam_noReturn(req.paramBody, 'address');
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');
}

function deleteBody(req) {
}


function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_promise_is_organizer_check'
        , [
              req.headers['user_uid']
            , req.paramBody['promise_uid']
        ]
    );
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_promise'
        , [
            req.headers['user_uid']
          , req.paramBody['promise_uid']
          , req.paramBody['promise_date']
          , req.paramBody['address']
          , req.paramBody['building_name']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
        ]
    );
}
