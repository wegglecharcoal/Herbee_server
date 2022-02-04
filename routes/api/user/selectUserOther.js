/**
 * Created by gunucklee on 2021. 09. 14.
 *
 * @swagger
 * /api/private/user/other:
 *   get:
 *     summary: 다른 유저 정보
 *     tags: [User]
 *     description: |
 *       path : /api/private/user/other
 *
 *       * 다른 유저 정보
 *
 *     parameters:
 *       - in: query
 *         name: user_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 유저 uid
 *
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

            req.innerBody['item'] = await queryCheck(req, db_connection);
            if (!req.innerBody['item']) {
                // 한글 버전
                // errUtil.createCall(errCode.empty, `회원가입하지 않은 유저입니다.`);
                // 영어 버전
                errUtil.createCall(errCode.empty, `This user isn't signed in.`)
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
    paramUtil.checkParam_noReturn(req.paramBody, 'user_uid');
}

function deleteBody(req) {
    delete req.innerBody['item']['push_token']
    delete req.innerBody['item']['access_token']
}


function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_info'
        , [
            req.paramBody['user_uid']
          , req.headers['user_uid']
        ]
    );
}



