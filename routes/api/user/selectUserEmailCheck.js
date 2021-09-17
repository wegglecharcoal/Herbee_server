/**
 * Created by gunucklee on 2021. 09. 14.
 *
 * @swagger
 * /api/public/user/email/check:
 *   get:
 *     summary: 사용 가능 이메일 여부 체크
 *     tags: [User]
 *     description: |
 *       path : /api/public/user/email/check
 *
 *       * 사용 가능 이메일 여부 체크
 *
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           example: test@email.com
 *         description: 가입할 이메일
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

            console.log("dmdfskdo");
            const email_data = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(email_data, '이미 가입한 이메일 입니다.');

            req.innerBody['success'] = '사용 가능한 이메일입니다.'

            deleteBody(req)
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
    paramUtil.checkParam_noReturn(req.paramBody, 'email');
}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_email_check'
        , [
            0
          , req.paramBody['email']
        ]
    );
}



