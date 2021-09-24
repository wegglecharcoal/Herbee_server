/**
 * Created by gunucklee on 2021. 09. 24.
 *
 * @swagger
 * /api/private/addressBook/default:
 *   put:
 *     summary: 만남 위치 설정
 *     tags: [Address]
 *     description: |
 *       path : /api/private/addressBook/default
 *
 *       * 만남 위치 설정
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           만남 위치 설정
 *         schema:
 *           type: object
 *           required:
 *             - addressBook_uid
 *           properties:
 *             addressBook_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 주소 uid
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
    paramUtil.checkParam_noReturn(req.paramBody, 'addressBook_uid');

}

function deleteBody(req) {
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_addressBook_default'
        , [
            req.headers['user_uid']
          , req.paramBody['addressBook_uid']
        ]
    );
}
