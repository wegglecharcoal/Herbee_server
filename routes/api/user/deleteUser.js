/**
 * Created by gunucklee on 2021. 09. 13.
 *
 * @swagger
 * /api/private/user:
 *   delete:
 *     summary: 유저 탈퇴
 *     tags: [User]
 *     description: |
 *       path : /api/private/user
 *
 *       * 유저 탈퇴
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
const jwtUtil = require('../../../common/utils/jwtUtil');

const errCode = require('../../../common/define/errCode');

let file_name = fileUtil.name(__filename);

module.exports = function (req, res) {
    const _funcName = arguments.callee.name;

    try {
        req.file_name = file_name;

        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);

        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};

            req.innerBody['item'] = await queryDelete(req, db_connection);


            if(req.innerBody['item']) {
                req.innerBody['success'] = '회원탈퇴가 완료되었습니다.';
            }

            deleteBody();
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

function deleteBody() {

}

function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_user'
        , [
            req.headers['user_uid']
        ]
    );
}