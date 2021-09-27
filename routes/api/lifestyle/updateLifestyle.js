/**
 * Created by gunucklee on 2021. 09. 27.
 *
 * @swagger
 * /api/private/lifestyle:
 *   put:
 *     summary: 라이프스타일 수정
 *     tags: [Lifestyle]
 *     description: |
 *       path : /api/private/lifestyle
 *
 *       * 라이프스타일 수정
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           라이프스타일 수정
 *         schema:
 *           type: object
 *           required:
 *             - lifestyle_uid
 *             - content
 *           properties:
 *             lifestyle_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 라이프스타일 uid
 *             content:
 *               type: string
 *               example: 라이프스타일 내용 수정입니다.
 *               description: |
 *                 내용
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
    paramUtil.checkParam_noReturn(req.paramBody, 'lifestyle_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'content');
}

function deleteBody(req) {
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_lifestyle'
        , [
            req.headers['user_uid']
          , req.paramBody['lifestyle_uid']
          , req.paramBody['content']
        ]
    );
}
