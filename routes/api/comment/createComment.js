/**
 * Created by gunucklee on 2021. 09. 19.
 *
 * @swagger
 * /api/private/comment:
 *   post:
 *     summary: 댓글 작성
 *     tags: [Comment]
 *     description: |
 *       path : /api/private/comment
 *
 *       * 댓글 작성
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           댓글 작성
 *         schema:
 *           type: object
 *           required:
 *             - target_uid
 *             - type
 *             - content
 *           properties:
 *             target_uid:
 *               type: number
 *               description: |
 *                 타겟 uid
 *                 * 0: 라이프스타일 => 라이프스타일 uid
 *                 * 1: 동네 후기 => 동네 후기 uid
 *             type:
 *               type: number
 *               description: |
 *                 댓글 타입
 *                 * 0: 라이프스타일
 *                 * 1: 동네 후기
 *             content:
 *               type: string
 *               description: |
 *                 내용
 *
 *           example:
 *             target_uid: 1
 *             type: 0
 *             content: 라이프 스타일 테스트 댓글 입니다.
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
const fcmUtil = require('../../../common/utils/fcmUtil');;

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

            let check = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(check,'이미 해당 댓글이 등록되어 있습니다.');

            req.innerBody['item'] = await queryCreate(req, db_connection);

            // FCM 기능 추후 반영 예정
            // if(req.headers['user_uid'] !== req.innerBody['item']['video_user_uid'])
            //     await fcmUtil.fcmVideoCommentSingle(req.innerBody['item'])

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
    paramUtil.checkParam_noReturn(req.paramBody, 'target_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'content');
}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_comment_check'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['content']
        ]
    );
}



function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_comment'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['content']
        ]
    );
}



