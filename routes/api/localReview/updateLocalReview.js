/**
 * Created by gunucklee on 2021. 09. 24.
 *
 * @swagger
 * /api/private/localReview:
 *   put:
 *     summary: 동네 후기 수정
 *     tags: [LocalReview]
 *     description: |
 *       path : /api/private/localReview
 *
 *       * 동네 후기 수정
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           동네 후기 수정
 *         schema:
 *           type: object
 *           required:
 *             - localReview_uid
 *             - content
 *           properties:
 *             localReview_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 동네후기 uid
 *             content:
 *               type: string
 *               example: 동네 후기 내용 수정입니다.
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
    paramUtil.checkParam_noReturn(req.paramBody, 'localReview_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'content');

}

function deleteBody(req) {
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_localReview'
        , [
            req.headers['user_uid']
          , req.paramBody['localReview_uid']
          , req.paramBody['content']
        ]
    );
}
