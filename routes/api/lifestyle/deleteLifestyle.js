/**
 * Created by gunucklee on 2021. 09. 27.
 *
 * @swagger
 * /api/private/lifestyle:
 *   delete:
 *     summary: 라이프스타일 삭제
 *     tags: [Lifestyle]
 *     description: |
 *       path : /api/private/lifestyle
 *
 *       * 라이프스타일 삭제
 *
 *     parameters:
 *       - in: query
 *         name: lifestyle_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 삭제할 라이프스타일 uid
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

            req.innerBody['item'] = await queryDelete(req, db_connection);

            if (req.innerBody['item']) {
                // 한글 버전
                // errUtil.createCall(errCode.fail, `삭제에 실패하였습니다.`);
                // 영어 버전
                errUtil.createCall(errCode.fail, `Failed to delete the lifestyle.`);
                return
            }

            // 한글 버전
            // req.innerBody['success'] = '라이프스타일 삭제가 완료되었습니다.';
            // 영어 버전
            req.innerBody['success'] = 'Success to delete the lifestyle';

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
    paramUtil.checkParam_noReturn(req.paramBody, 'lifestyle_uid');
}

function deleteBody(req) {
}

function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_lifestyle'
        , [
            req.headers['user_uid']
          , req.paramBody['lifestyle_uid']
        ]
    );
}
