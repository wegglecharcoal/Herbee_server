/**
 * Created by gunucklee on 2021. 09. 14.
 *
 * @swagger
 * /api/public/user/nickname/check:
 *   get:
 *     summary: 사용 가능 닉네임 여부 체크
 *     tags: [User]
 *     description: |
 *       path : /api/public/user/nickname/check
 *
 *       * 사용 가능 닉네임 여부 체크
 *
 *     parameters:
 *       - in: query
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *           example: 귀여운다람쥐
 *         description: 사용할 닉네임
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
const errCode = require("../../../common/define/errCode");

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

            const nickname_data = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(nickname_data, errCode.already_nickname,'Error code: 511 [이미 사용 중인 닉네임 입니다.]');

            req.innerBody['success'] = '사용 가능한 닉네임 입니다.';

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
    paramUtil.checkParam_noReturn(req.paramBody, 'nickname');
}

function deleteBody(req) {
}


function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_nickname_check'
        , [
              0
            , req.paramBody['nickname']
        ]
    );
}

