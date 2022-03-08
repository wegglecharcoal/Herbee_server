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
const fcmUtil = require('../../../common/utils/fcmUtil');

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

            await fcmFunction(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'target_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'content');
}

function deleteBody(req) {
    delete req.innerBody['item']['fcm_nickname_me'];
    delete req.innerBody['item']['fcm_filename_me'];
    delete req.innerBody['item']['fcm_push_token_other'];
    delete req.innerBody['item']['fcm_type'];
    delete req.innerBody['item']['fcm_target_uid'];
    delete req.innerBody['item']['alert_source_uid'];
    delete req.innerBody['item']['alert_target_uid'];
    delete req.innerBody['item']['alert_type'];
    delete req.innerBody['item']['fcm_title'];
    delete req.innerBody['item']['fcm_message'];
    delete req.innerBody['item']['fcm_channel'];
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

function queryCreateAlertHistory(item, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_alert_history'
        , [
              item['alert_source_uid']
            , item['alert_target_uid']
            , item['alert_type']
            , item['fcm_message']
        ]
    );
}


async function fcmFunction(req, db_connection) {

    let herbee_language_list = process.env.HERBEE_LANGUAGE_TYPES.split(',');

    for (let i in herbee_language_list) {
        if (herbee_language_list[i] == req.innerBody['item']['fcm_language_other']) {
            switch (req.innerBody['item']['fcm_language_other']) {
                case 'ko':
                    req.innerBody['item']['fcm_title'] = `댓글 알림`;
                    req.innerBody['item']['fcm_message'] = `${req.innerBody['item']['fcm_nickname_me']}님이 게시물에 댓글을 남겼습니다.`;
                    req.innerBody['item']['fcm_channel'] = `댓글`;
                    break;
                case 'en':
                    req.innerBody['item']['fcm_title'] = "left a comment notification";
                    req.innerBody['item']['fcm_message'] = `${req.innerBody['item']['fcm_nickname_me']} left a comment on the post.`;
                    req.innerBody['item']['fcm_channel'] = `comment`;
                    break;
            }
        }

    }
    await fcmUtil.fcmCommentSingle(req.innerBody['item']);
    req.innerBody['item']['alert_type'] = 3;
    await queryCreateAlertHistory(req.innerBody['item'], db_connection);

}