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
                switch (req.paramBody['type']) {

                    case 1:
                    case 2:
                        await fcmUtil.fcmLikePostSingle(req.innerBody['item']);
                        break;
                    case 3:
                    case 4:
                        await fcmUtil.fcmLikeCommentSingle(req.innerBody['item']);
                        break;
                    default:
                        break;

                }
            }


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
    paramUtil.checkParam_noReturn(req.paramBody, 'is_like');
}

function deleteBody(req) {
    delete req.innerBody['item']['fcm_nickname'];
    delete req.innerBody['item']['fcm_push_token'];
    delete req.innerBody['item']['fcm_filename'];
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

