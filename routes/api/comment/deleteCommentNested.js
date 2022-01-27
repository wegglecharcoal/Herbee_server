/**
 * Created by gunucklee on 2021. 09. 23.
 *
 * @swagger
 * /api/private/comment/nested:
 *   delete:
 *     summary: 대댓글 삭제
 *     tags: [Comment]
 *     description: |
 *       path : /api/private/comment/nested
 *
 *       * 대댓글 삭제
 *
 *     parameters:
 *       - in: query
 *         name: comment_nested_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: 삭제할 대댓글 uid
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
const jwtUtil = require('../../../common/utils/jwtUtil');

const errCode = require('../../../common/define/errCode');

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

            req.innerBody['item'] = await queryDelete(req, db_connection);
            if (!req.innerBody['item']) {
                // 한글 버전
                // errUtil.createCall(errCode.param, `대댓글 삭제에 실패하였습니다.`);
                // 영어 버전
                errUtil.createCall(errCode.param, `Failed to delete the nested comment.`);


                return
            }

            // 한글 버전
            // req.innerBody['success'] = '대댓글 삭제가 완료되었습니다.'
            // 영어 버전
            req.innerBody['success'] = 'Success to delete the nested comment.';

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
}

function deleteBody(req) {
}

function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_comment_nested'
        , [
            req.headers['user_uid'],
            req.paramBody['comment_nested_uid'],
        ]
    );
}
