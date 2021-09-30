/**
 * Created by gunucklee on 2021. 09. 23.
 *
 * @swagger
 * /api/private/alert/msg:
 *   put:
 *     summary: 메시지 알림 on/off
 *     tags: [Alert]
 *     description: |
 *       path : /api/private/alert/msg
 *
 *       * 메시지 알림 on/off
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           메시지 알림 on/off
 *         schema:
 *           type: object
 *           required:
 *             - is_alert_msg
 *           properties:
 *             is_alert_msg:
 *               type: number
 *               example: 0
 *               description: |
 *                 메시지 알림 on/off
 *                 * 0: on
 *                 * 1: off
 *               enum: [0,1]
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
    paramUtil.checkParam_noReturn(req.paramBody, 'is_alert_msg');

}

function deleteBody(req) {
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_alert_msg'
        , [
            req.headers['user_uid']
          , req.paramBody['is_alert_msg']
        ]
    );
}
