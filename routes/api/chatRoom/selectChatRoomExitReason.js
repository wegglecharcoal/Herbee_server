/**
 * Created by gunucklee on 2021. 10. 07.
 *
 * @swagger
 * /api/private/chatRoom/exit/reason:
 *   get:
 *     summary: 종료 이유
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/exit/reason
 *
 *       * 종료 이유
 *
 *     parameters:
 *       - in: query
 *         name: chat_room_uid
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: |
 *           채팅방 uid
 *
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

            let check = await queryCheck(req, db_connection);
            if (check) {
                errUtil.createCall(errCode.empty, `아직 진행 중인 채팅방입니다. 채팅방을 종료 이후 다시 시도해주세요.`);
                return;
            }

            req.innerBody['item'] = await querySelect(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'chat_room_uid');
}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_user_all_check'
        , [
            req.headers['user_uid']
           ,req.paramBody['chat_room_uid']
        ]
    );
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_exit_reason'
        , [
             req.headers['user_uid']
            ,req.paramBody['chat_room_uid']
        ]
    );
}