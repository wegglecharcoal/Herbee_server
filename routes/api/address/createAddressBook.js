/**
 * Created by gunucklee on 2021. 09. 24.
 *
 * @swagger
 * /api/private/addressBook:
 *   post:
 *     summary: 주소 추가
 *     tags: [Address]
 *     description: |
 *       path : /api/private/addressBook
 *
 *       * 주소 추가
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           주소 추가
 *         schema:
 *           type: object
 *           required:
 *             - address
 *             - latitude
 *             - longitude
 *             - is_default
 *             - type
 *           properties:
 *             address:
 *               type: string
 *               description: |
 *                 주소
 *             latitude:
 *               type: number
 *               description: |
 *                 위도
 *             longitude:
 *               type: number
 *               description: |
 *                 경도
 *             is_default:
 *               type: number
 *               description: |
 *                 기본 주소
 *                 *0: false
 *                 *1: true
 *             type:
 *               type: number
 *               description: |
 *                 주소 타입
 *                 *0: 기본 위치
 *                 *1: 현재 위치
 *           example:
 *             address: 부산 수영구 망미동
 *             latitude: 37.5662952
 *             longitude: 126.9773966
 *             is_default: 1
 *             type: 0
 *
 *     responses:
 *       200:
 *         description: 결과 정보
 */
let paramUtil;
paramUtil = require('../../../common/utils/paramUtil');
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

            req.innerBody['item'] = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(req.innerBody['item'], '이미 등록된 주소입니다.');

            req.innerBody['item'] = await queryCreate(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'address');
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'is_default');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
}

function deleteBody(req) {
}

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_addressBook'
        , [
            req.headers['user_uid']
          , req.paramBody['address']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
          , req.paramBody['is_default']
          , req.paramBody['type']
        ]
    );
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_addressBook_check'
        , [
            req.headers['user_uid']
          , req.paramBody['address']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
          , req.paramBody['is_default']
          , req.paramBody['type']
        ]
    );
}

