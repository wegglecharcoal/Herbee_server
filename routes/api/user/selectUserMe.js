/**
 * Created by gunucklee on 2021. 01. 02.
 *
 * @swagger
 * /api/private/user/me:
 *   get:
 *     summary: 내 유저 정보
 *     tags: [User]
 *     description: |
 *       path : /api/private/user/me
 *
 *       * 내 유저 정보
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

    try {
        req.file_name = file_name;
        logUtil.printUrlLog(req, `== function start ==================================`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};

            req.innerBody['item'] = await querySelect(req, db_connection);
            if (!req.innerBody['item']) {
                errUtil.createCall(errCode.non_exist_user, `Error code: 307 [회원가입하지 않은 유저입니다.]`);
                return;
            }

            deleteBody(req);
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });



    } catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}


function checkParam(req) {
}

function deleteBody(req) {
    delete req.innerBody['item']['push_token']
    delete req.innerBody['item']['access_token']
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_info'
        , [
            req.headers['user_uid']
          , req.headers['user_uid']
        ]
    );

}