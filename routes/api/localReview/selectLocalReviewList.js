/**
 * Created by gunucklee on 2021. 10. 19.
 *
 * @swagger
 * /api/private/localReview/list:
 *   get:
 *     summary: 동네후기 목록
 *     tags: [LocalReview]
 *     description: |
 *       path : /api/private/localReview/list
 *
 *       * 동네후기 목록 (만남 지역 넓히기 기능 떄문에 좌표값으로 받아야 함)
 *
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *           example:
 *         description: 검색 키워드
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
        , 'call proc_select_localReview_list'
        , [
            req.headers['user_uid']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
          , req.paramBody['keyword']
          , req.paramBody['offset']
        ]
    );
}
