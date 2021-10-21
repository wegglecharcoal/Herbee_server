/**
 * Created by gunucklee on 2021. 10. 21.
 *
 * @swagger
 * /api/private/promise/my/position:
 *   put:
 *     summary: 약속 나의 현재 위치 변경
 *     tags: [Promise]
 *     description: |
 *       path : /api/private/promise/my/position
 *
 *       * 약속 나의 현재 위치 변경
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
 *             - latitude
 *             - longitude
 *           properties:
 *             promise_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 약속 uid
 *             latitude:
 *               type: number
 *               example: 37.5662952
 *               description: |
 *                 현재 위도
 *             longitude:
 *               type: number
 *               example: 126.9773966
 *               description: |
 *                 현재 경도
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


            let meet_success = await queryCheck(req, db_connection);

            req.innerBody['item'] = await queryUpdate(req, db_connection);
            req.innerBody['item']['is_meet_success'] = meet_success ?  1 : 0;

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
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');
}

function deleteBody(req) {
}


function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_meet_success_check'
        , [
            req.paramBody['promise_uid']
        ]
    );
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_update_promise_my_position'
        , [
            req.headers['user_uid']
          , req.paramBody['promise_uid']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
        ]
    );
}
