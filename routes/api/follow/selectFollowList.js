/**
 * Created by gunucklee on 2021. 09. 16.
 *
 * @swagger
 * /api/private/follow/list:
 *   get:
 *     summary: 팔로우 목록
 *     tags: [Follow]
 *     description: |
 *       path : /api/private/follow/list
 *
 *       * 팔로우 목록
 *
 *     parameters:
 *       - in: query
 *         name: search_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 검색 uid
 *       - in: query
 *         name: type
 *         default: follower
 *         required: true
 *         schema:
 *           type: string
 *           example: follower
 *         description: |
 *           목록 타입
 *           * follower: 팔로워
 *           * following: 팔로잉
 *         enum: [follower, following]
 *       - in: query
 *         name: last_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 0
 *         description: 목록 마지막 uid (처음일 경우 0)
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

            let count_data = await querySelectTotalCount(req, db_connection);
            req.innerBody['item'] = await querySelect(req, db_connection);
            req.innerBody['total_count'] = count_data['total_count'];

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
    paramUtil.checkParam_noReturn(req.paramBody, 'search_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'last_uid');
}

function deleteBody(req) {
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_follow_list'
        , [
            req.headers['user_uid']
          , req.paramBody['search_uid']
          , req.paramBody['type']
          , req.paramBody['last_uid']
        ]
    );
}

function querySelectTotalCount(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_follow_total_count'
        , [
            req.paramBody['search_uid']
          , req.paramBody['type']
        ]
    );
}
