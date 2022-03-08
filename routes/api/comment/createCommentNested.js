/**
 * Created by gunucklee on 2021. 09. 21.
 *
 * @swagger
 * /api/private/comment/nested:
 *   post:
 *     summary: 대댓글 작성
 *     tags: [Comment]
 *     description: |
 *       path : /api/private/comment/nested
 *
 *       * 댓글 작성
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           대댓글 작성
 *         schema:
 *           type: object
 *           required:
 *             - comment_uid
 *             - content
 *           properties:
 *             comment_uid:
 *               type: number
 *               description: |
 *                 댓글 uid
 *             content:
 *               type: string
 *               description: |
 *                 내용
 *
 *           example:
 *             comment_uid: 1
 *             content: 테스트 대댓글 입니다.
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

            req.innerBody['item'] = await queryCreate(req, db_connection);
            await fcmFunction(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'comment_uid');
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
}

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_comment_nested'
        , [
              req.headers['user_uid']
            , req.paramBody['comment_uid']
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
                    req.innerBody['item']['fcm_message'] = `${req.innerBody['fcm_nickname_me']}님이 댓글에 대댓글을 남겼습니다.`;
                    req.innerBody['item']['fcm_channel'] = `댓글`;
                    break;
                case 'en':
                    req.innerBody['item']['fcm_title'] = "left a comment notification";
                    req.innerBody['item']['fcm_message'] = `${req.innerBody['fcm_nickname_me']} left a nested comment on the comment.`;
                    req.innerBody['item']['fcm_channel'] = `comment`;
                    break;
            }
        }

    }
    await fcmUtil.fcmCommentSingle(req.innerBody['item'])
    req.innerBody['item']['alert_type'] = 3;
    await queryCreateAlertHistory(req.innerBody['item'], db_connection);

}