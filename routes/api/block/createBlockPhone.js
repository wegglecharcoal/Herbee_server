/**
 * Created by gunucklee on 2021. 10. 08.
 *
 * @swagger
 * /api/private/block/phone:
 *   post:
 *     summary: 연락처 차단
 *     tags: [Block]
 *     description: |
 *       path : /api/private/block/phone
 *
 *       * 연락처 차단
 *       아는 사람이 있다면 유저 차단 테이블에 is_contact === 1 값으로 추가됩니다.
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           연락처 차단
 *         schema:
 *           type: object
 *           required:
 *             - block_phone_list
 *           properties:
 *             content:
 *               type: string
 *               description: |
 *                 연락처 차단 리스트
 *
 *
 *           example:
 *             block_phone_list: 01042474622,01033334444,01022221111,01099995555,01011322244,01033423343,01022312322
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

    try{
        req.file_name = file_name;
        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};

            req.innerBody['item'] = await queryCreate(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'block_phone_list');
}

function deleteBody(req) {
}

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_block_phone'
        , [
              req.headers['user_uid']
            , req.paramBody['block_phone_list']
        ]
    );
}


