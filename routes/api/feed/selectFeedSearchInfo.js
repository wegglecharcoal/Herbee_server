/**
 * Created by gunucklee on 2022. 02. 16.
 *
 * @swagger
 * /api/private/feed/search/info:
 *   get:
 *     summary: 피드 검색 정보
 *     tags: [Feed]
 *     description: |
 *       path : /api/private/feed/search/info
 *
 *       * 피드 검색 정보
 *
 *     parameters:
 *       - in: query
 *         name: feed_uid
 *         default: 9
 *         required: true
 *         schema:
 *           type: number
 *           example: 9
 *         description: |
 *           피드 uid
 *       - in: query
 *         name: type
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 0
 *         description: |
 *           피드 타입
 *           * 0: 라이프스타일
 *           * 1: 동네후기
 *         enum: [0,1]
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

    try {
        req.file_name = file_name;
        logUtil.printUrlLog(req, `== function start ==================================`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};

            req.innerBody['item'] = await querySelect(req, db_connection);

            deleteBody(req)
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });

    } catch (e) {
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

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_feed_search_info'
        , [
            req.headers['user_uid']
          , req.paramBody['feed_uid']
          , req.paramBody['type']
        ]
    );
}
