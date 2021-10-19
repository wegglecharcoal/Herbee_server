/**
 * Created by gunucklee on 2021. 10. 19.
 *
 * @swagger
 * /api/private/localReview/recent/visit/list:
 *   get:
 *     summary: 최근 방문 목록
 *     tags: [LocalReview]
 *     description: |
 *       path : /api/private/localReview/recent/visit/list
 *
 *       * 최근 방문 목록
 *
 *     parameters:
 *       - in: query
 *         name: address
 *         default: 부산시 수영구 망미로 21번길 13
 *         required: true
 *         schema:
 *           type: string
 *           example: 부산시 수영구 망미로 21번길 13
 *         description: |
 *           주소
 *       - in: query
 *         name: building_name
 *         default: 공룡 슈퍼마켓
 *         required: true
 *         schema:
 *           type: string
 *           example: 공룡 슈퍼마켓
 *         description: |
 *           빌딩 이름
 *       - in: query
 *         name: last_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 0
 *         description: |
 *           목록 마지막 uid (처음일 경우 0)
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

    try {
        req.file_name = file_name;
        logUtil.printUrlLog(req, `== function start ==================================`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};

            req.innerBody['item'] = await querySelect(req, db_connection);


            deleteBody(req);
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
    paramUtil.checkParam_noReturn(req.paramBody, 'address');
    paramUtil.checkParam_noReturn(req.paramBody, 'building_name');
    paramUtil.checkParam_noReturn(req.paramBody, 'last_uid');
}

function deleteBody(req) {
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_localReview_recent_visit_list'
        , [
            req.headers['user_uid']
          , req.paramBody['address']
          , req.paramBody['building_name']
          , req.paramBody['last_uid']

        ]
    );
}
