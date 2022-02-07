/**
 * Created by gunucklee on 2022. 01. 20.
 *
 * @swagger
 * /api/private/lifestyle/recent/list:
 *   get:
 *     summary: 최근 등록된 게시물
 *     tags: [Lifestyle]
 *     description: |
 *       path : /api/private/lifestyle/recent/list
 *
 *       * 최근 등록된 게시물
 *
 *     parameters:
 *       - in: query
 *         name: latitude
 *         default: 37.5662952
 *         required: true
 *         schema:
 *           type: number
 *           example: 37.5662952
 *         description: |
 *           위도
 *       - in: query
 *         name: longitude
 *         default: 127.1039913
 *         required: true
 *         schema:
 *           type: number
 *           example: 127.1039913
 *         description: |
 *           경도
 *       - in: query
 *         name: offset
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 0
 *         description: |
 *           0을 넣으면 30개의 정보를 가져옵니다 Limit 30
 *           offset 0: 0~30개 정보
 *           offset 30: 30~60개 정보
 *           offset 60: 60~90개 정보
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
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'offset');
}

function deleteBody(req) {
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_lifestyle_recent_list'
        , [
            req.headers['user_uid']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
          , req.paramBody['offset']
        ]
    );
}
