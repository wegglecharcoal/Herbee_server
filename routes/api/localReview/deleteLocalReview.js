/**
 * Created by gunucklee on 2021. 09. 23.
 *
 * @swagger
 * /api/private/localReview:
 *   delete:
 *     summary: 동네 후기 삭제
 *     tags: [LocalReview]
 *     description: |
 *       path : /api/private/localReview
 *
 *       * 동네 후기 삭제
 *
 *     parameters:
 *       - in: query
 *         name: localReview_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 삭제할 동네 후기 uid
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
            console.log("ASD:" + JSON.stringify(req.innerBody['item']))
            if (req.innerBody['item']) {
                errUtil.createCall(errCode.fail_delete_local_review, `Error code: 206 [동네후기 삭제에 실패하였습니다]`);
                return;
            }

            req.innerBody['success'] = '동네 후기 삭제가 완료되었습니다.';

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
    paramUtil.checkParam_noReturn(req.paramBody, 'localReview_uid');
}

function deleteBody(req) {
}

function queryDelete(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_delete_localReview'
        , [
            req.headers['user_uid']
          , req.paramBody['localReview_uid']
        ]
    );
}
