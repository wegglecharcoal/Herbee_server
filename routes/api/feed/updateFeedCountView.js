/**
 * Created by gunucklee on 2021. 11. 12.
 *
 * @swagger
 * /api/private/feed/count/view:
 *   put:
 *     summary: 피드 조회수 업데이트
 *     tags: [Feed]
 *     description: |
 *       path : /api/private/feed/count/view
 *
 *       * 피드 조회수 업데이트
 *       type: 라이프스타일 or 동네후기
 *          * 0: 라이프스타일
 *          * 1: 동네후기
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           피드 조회수 업데이트
 *         schema:
 *           type: object
 *           required:
 *             - feed_uid
 *             - type
 *           properties:
 *             feed_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 피드 uid
 *             type:
 *               type: number
 *               example: 0
 *               description: |
 *               라이프스타일 or 동네후기
 *                 * 0: 라이프스타일
 *                 * 1: 동네후기
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
    paramUtil.checkParam_noReturn(req.paramBody, 'feed_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
}

function deleteBody(req) {
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_feed_count_view'
        , [
            req.paramBody['feed_uid']
          , req.paramBody['type']
        ]
    );
}

