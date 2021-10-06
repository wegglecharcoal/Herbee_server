/**
 * Created by gunucklee on 2021. 09. 23.
 *
 * @swagger
 * /api/private/comment/list:
 *   get:
 *     summary: 댓글 목록
 *     tags: [Comment]
 *     description: |
 *       path : /api/private/comment/list
 *
 *       * 댓글 목록
 *       * 대댓글 내용 정보 가져오는 api: /api/private/comment/nested
 *
 *     parameters:
 *       - in: query
 *         name: target_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: 댓글이 달린 파일 uid
 *       - in: query
 *         name: type
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: |
 *           댓글 타입
 *           * 0: 라이프스타일
 *           * 1: 동네후기
 *       - in: query
 *         name: last_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 0
 *         description: |
 *           목록 마지막 uid (처음일 경우 0)
 *
 *     responses:
 *       200:
 *         description: 결과 정보
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

            let count_data = await queryCount(req, db_connection);
            req.innerBody['item'] = await querySelect(req, db_connection);
            req.innerBody['item'] = createJSONArray(req.innerBody['item']);
            req.innerBody['total_count'] = count_data['total_count'];


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
    paramUtil.checkParam_noReturn(req.paramBody, 'target_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'last_uid');
}

function deleteBody(req) {
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.queryArray(db_connection
        , 'call proc_select_comment_list'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['last_uid']
        ]
    );
}

function queryCount(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_comment_total_count'
        , [
            req.paramBody['target_uid']
          , req.paramBody['type']
        ]
    );
}


function createJSONArray(item){
    if( item ) {
        for( let idx in item ){
            item[idx]['comment_nested_preview_list'] = JSON.parse(item[idx]['comment_nested_preview_list']);
        }
    }
    return item;
}


