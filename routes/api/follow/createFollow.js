/**
 * Created by gunucklee on 2021. 09. 16.
 *
 * @swagger
 * /api/private/follow:
 *   post:
 *     summary: 팔로우 하기
 *     tags: [Follow]
 *     description: |
 *       path : /api/private/follow
 *
 *       * 팔로우 하기
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           팔로잉
 *         schema:
 *           type: object
 *           required:
 *             - user_uid
 *           properties:
 *             user_uid:
 *               type: integer
 *               description: |
 *                 팔로잉 타겟 유저 uid
 *
 *           example:
 *             user_uid: 1
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

            req.innerBody['item'] = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(req.innerBody['item'], '이미 팔로우 된 유저입니다.');

            req.innerBody['item'] = await queryCreate(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'user_uid');
}

function deleteBody(req) {
}

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_follow'
        , [
            req.headers['user_uid']
          , req.paramBody['user_uid']
        ]
    );
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_follow_check'
        , [
            req.headers['user_uid']
          , req.paramBody['user_uid']
        ]
    );
}

