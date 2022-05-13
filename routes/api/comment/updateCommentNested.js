/**
 * Created by gunucklee on 2022. 05. 13.
 *
 * @swagger
 * /api/private/comment/nested:
 *   put:
 *     summary: 대댓글 변경
 *     tags: [Comment]
 *     description: |
 *       path : /api/private/comment/nested
 *
 *       * 대댓글 변경
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           대댓글 변경
 *         schema:
 *           type: object
 *           required:
 *             - comment_nested_uid
 *             - content
 *           properties:
 *             comment_nested_uid:
 *               type: number
 *               example: 11
 *               description: |
 *                  대댓글 uid
 *             content:
 *               type: string
 *               example: 댓글 수정 내용
 *               description: |
 *                 내용
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
    paramUtil.checkParam_noReturn(req.paramBody, 'comment_nested_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'content');
}

function deleteBody(req) {
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_comment_nested'
        , [
            req.headers['user_uid']
          , req.paramBody['comment_nested_uid']
          , req.paramBody['content']
        ]
    );
}
