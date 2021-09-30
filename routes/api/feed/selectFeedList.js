/**
 * Created by gunucklee on 2021. 09. 27.
 *
 * @swagger
 * /api/private/feed/list:
 *   get:
 *     summary: 피드 목록
 *     tags: [Feed]
 *     description: |
 *       path : /api/private/feed/list
 *
 *       * 피드 목록
 *
 *     parameters:
 *       - in: query
 *         name: km
 *         default: 1000
 *         required: true
 *         schema:
 *           type: number
 *           example: 1000
 *         description: |
 *           검색 거리(단위 km)
 *           * 전체: 1000
 *           * 내 주변: 1, 3, 5, 10
 *         enum: [1,3,5,10,1000]
 *       - in: query
 *         name: random_seed
 *         required: true
 *         schema:
 *           type: string
 *           example: 133q1234
 *         description: |
 *           랜덤 순서를 고정시켜주는 시드입니다.
 *       - in: query
 *         name: offset
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 0
 *         description: |
 *           페이지 시작 값을 넣어주시면 됩니다. Limit 30
 *           offset 0: 0~30
 *           offset 30: 30~60
 *           offset 60: 60~90
 *           ...
 *           ...
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
    paramUtil.checkParam_noReturn(req.paramBody, 'km');
    paramUtil.checkParam_noReturn(req.paramBody, 'random_seed');
    paramUtil.checkParam_noReturn(req.paramBody, 'offset');
}

function deleteBody(req) {
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_feed_list'
        , [
            req.headers['user_uid']
          , req.paramBody['km']
          , req.paramBody['random_seed']
          , req.paramBody['offset']
        ]
    );
}
