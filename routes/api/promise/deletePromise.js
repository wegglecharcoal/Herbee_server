/**
 * Created by gunucklee on 2021. 10. 06.
 *
 * @swagger
 * /api/private/promise:
 *   delete:
 *     summary: 약속 취소 (주최자만 가능)
 *     tags: [Promise]
 *     description: |
 *       path : /api/private/promise
 *
 *       * 약속 취소 (주최자만 가능)
 *
 *     parameters:
 *       - in: query
 *         name: promise_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 삭제할 약속 uid
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


            let check = await queryCheck(req, db_connection);
            if (!check) {
                // 한글 버전
                // errUtil.createCall(errCode.fail, `약속 주최자만 약속을 변경할 수 있는 권한이 주어집니다.`);
                // 영어 버전
                errUtil.createCall(errCode.fail, `Only the promise organizer is given the right to change the promise.`);
                return;
            }


            req.innerBody['item'] = await queryDelete(req, db_connection);

            if (req.innerBody['item']) {
                // 한글 버전
                // errUtil.createCall(errCode.fail, `삭제에 실패하였습니다.`);
                // 영어 버전
                errUtil.createCall(errCode.fail, `Failed to delete the promise.`);
                return;
            }

            // 한글 버전
            // req.innerBody['success'] = '약속 삭제가 완료되었습니다.';
            // 영어 버전
            errUtil.createCall(errCode.fail, `Failed to delete the promise.`);

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

function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_promise'
        , [
            req.headers['user_uid']
          , req.paramBody['promise_uid']
        ]
    );
}
