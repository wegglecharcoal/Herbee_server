/**
 * Created by gunucklee on 2021. 10. 22.
 *
 * @swagger
 * /api/private/block/user:
 *   post:
 *     summary: 유저 차단
 *     tags: [Block]
 *     description: |
 *       path : /api/private/block/user
 *
 *       * 유저 차단
 *
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           연락처 차단
 *         schema:
 *           type: object
 *           required:
 *             - target_uid
 *           properties:
 *             target_uid:
 *               type: string
 *               description: |
 *                 차단 당하는 유저 Uid
 *
 *
 *           example:
 *             target_uid: 6
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
            // 한글 버전
            // paramUtil.checkParam_alreadyUse(check,'이미 차단되어있는 유저입니다.');
            // 영어 버전
            paramUtil.checkParam_alreadyUse(check,'A user who is already blocked.');

            req.innerBody['item'] = await queryCreate(req, db_connection);

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
}

function deleteBody(req) {
}


function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_block_user_check'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
        ]
    );
}


function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_block_user'
        , [
              req.headers['user_uid']
            , req.paramBody['target_uid']
        ]
    );
}


