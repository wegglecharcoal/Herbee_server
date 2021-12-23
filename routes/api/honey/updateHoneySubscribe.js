/**
 * Created by gunucklee on 2021. 12. 23.
 *
 * @swagger
 * /api/private/honey/subscribe:
 *   put:
 *     summary: 구독
 *     tags: [Honey]
 *     description: |
 *       path : /api/private/honey/subscribe
 *
 *       * 구독하기
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           구독하기
 *         schema:
 *           type: object
 *           required:
 *             - is_subscribe
 *           properties:
 *             is_subscribe:
 *               type: number
 *               example: 1
 *               description: |
 *                 구독 여부
 *                 * 0: 구독 취소
 *                 * 1: 구독
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
    paramUtil.checkParam_noReturn(req.paramBody, 'is_subscribe');
}

function deleteBody(req) {
}


function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_honey_subscribe'
        , [
            req.headers['user_uid']
          , req.paramBody['is_subscribe']
        ]
    );
}
