/**
 * Created by gunucklee on 2021. 09. 28.
 *
 * @swagger
 * /api/private/like:
 *   put:
 *     summary: 좋아요
 *     tags: [Like]
 *     description: |
 *       path : /api/private/like
 *
 *       * 좋아요
 *       * like or unlike
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           좋아요
 *         schema:
 *           type: object
 *           required:
 *             - target_uid
 *             - type
 *             - is_like
 *           properties:
 *             target_uid:
 *               type: number
 *               description: |
 *                 타겟 uid
 *                 * 1: 라이프스타일 uid
 *                 * 2: 동네후기 uid
 *                 * 3: 댓글 uid
 *                 * 4: 대댓글 uid
 *             type:
 *               type: number
 *               description: |
 *                 좋아요 타입
 *                 * 1: 라이프스타일 uid
 *                 * 2: 동네후기 uid
 *                 * 3: 댓글 uid
 *                 * 4: 대댓글 uid
 *               enum: [1,2,3,4]
 *             is_like:
 *               type: number
 *               description: |
 *                 좋아요 여부
 *                 * 0: unlike
 *                 * 1: like
 *               enum: [0,1]
 *
 *           example:
 *             target_uid: 1
 *             type: 1
 *             is_like: 1
 *
 *     responses:
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

const fcmUtil = require('../../../common/utils/fcmUtil');

let file_name = fileUtil.name(__filename);

module.exports = function (req, res) {
    const _funcName = arguments.callee.name;

    try{
        req.file_name = file_name;
        // logUtil.printUrlLog(req, `== function start ==================================`);
        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);
        req.paramBody = paramUtil.parse(req);
        // logUtil.printUrlLog(req, `param: ${JSON.stringify(req.paramBody)}`);

        checkParam(req);

        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};
            req.innerBody['item'] = await queryUpdate(req, db_connection);

            if(req.paramBody['is_like'] === 1
                && (parseInt(req.innerBody['item']['target_user_uid']) !== req.headers['user_uid']) ) {

                req.innerBody['item']['alert_type'] = 2;

                switch (req.paramBody['type']) {

                    case 1:
                    case 2:
                        await fcmFunction(req, db_connection);
                        break;
                    case 3:
                    case 4:
                        await fcmFunction(req, db_connection);
                        break;
                    default:
                        break;

                }
            }


            deleteBody(req)
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);
        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });

    }
    catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}

function checkParam(req) {
    paramUtil.checkParam_noReturn(req.paramBody, 'target_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'is_like');
}

function deleteBody(req) {
    delete req.innerBody['item']['fcm_nickname_me'];
    delete req.innerBody['item']['fcm_filename_me'];
    delete req.innerBody['item']['fcm_push_token_other'];
    delete req.innerBody['item']['alert_source_uid'];
    delete req.innerBody['item']['alert_target_uid'];
    delete req.innerBody['item']['alert_type'];
    delete req.innerBody['item']['fcm_title'];
    delete req.innerBody['item']['fcm_message'];
    delete req.innerBody['item']['fcm_channel'];
}


function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_like'
        , [
            req.headers['user_uid'],
            req.paramBody['target_uid'],
            req.paramBody['type'],
            req.paramBody['is_like'],
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
                    req.innerBody['item']['fcm_title'] = ((req.paramBody['type'] == 1) || (req.paramBody['type'] == 2)) ?
                                             `게시물 좋아요 알림` : `댓글 좋아요 알림`;
                    req.innerBody['item']['fcm_message'] = ((req.paramBody['type'] == 1) || (req.paramBody['type'] == 2)) ?
                                             `${req.innerBody['item']['fcm_nickname_me']}님이 게시물에 좋아요를 눌렀습니다.` : `${req.innerBody['item']['fcm_nickname_me']}님이 댓글에 좋아요를 눌렀습니다.`;
                    req.innerBody['item']['fcm_channel'] = `좋아요`;
                    break;
                case 'en':
                    req.innerBody['item']['fcm_title'] = ((req.paramBody['type'] == 1) || (req.paramBody['type'] == 2)) ?
                                             `clicked like on the post notification` : `pressed comment like notification`;
                    req.innerBody['item']['fcm_message'] = ((req.paramBody['type'] == 1) || (req.paramBody['type'] == 2)) ?
                                             `${req.innerBody['item']['fcm_nickname_me']} clicked like on the post.` : `${req.innerBody['item']['fcm_nickname_me']} pressed like in the comments.`;
                    req.innerBody['item']['fcm_channel'] = `like`;
                    break;
            }
        }
    }

    ((req.paramBody['type'] == 1) || (req.paramBody['type'] == 2)) ?
                                     await fcmUtil.fcmLikePostSingle(req.innerBody['item']) : await fcmUtil.fcmLikeCommentSingle(req.innerBody['item']);

    await queryCreateAlertHistory(req.innerBody['item'], db_connection);
}