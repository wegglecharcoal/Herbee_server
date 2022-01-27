/**
 * Created by gunucklee on 2021. 09. 23.
 *
 * @swagger
 * /api/private/alert/history:
 *   delete:
 *     summary: 알림 히스토리 삭제
 *     tags: [Alert]
 *     description: |
 *       path : /api/private/alert/history
 *
 *       * 알림 히스토리 삭제
 *
 *     parameters:
 *       - in: query
 *         name: alert_history_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 삭제할 알림 히스토리 uid
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

            await queryDelete(req, db_connection);
            // 한글 버전
            // req.innerBody['success'] = '알림 히스토리 삭제가 완료되었습니다.';
            // 영어 버전
            req.innerBody['success'] = 'Success to delete the alert history';

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
    paramUtil.checkParam_noReturn(req.paramBody, 'alert_history_uid');
}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_alert_history_check'
        , [
            req.headers['user_uid']
          , req.paramBody['alert_history_uid']
        ]
    );
}

function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_alert_history'
        , [
            req.headers['user_uid']
          , req.paramBody['alert_history_uid']
        ]
    );
}
