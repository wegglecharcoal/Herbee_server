/**
 * Created by gunucklee on 2021. 12. 21.
 *
 * @swagger
 * /api/private/chatRoom/head:
 *   put:
 *     summary: 방장 위임하기
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/head
 *
 *       * 방장 위임하기
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           방장 위임하기
 *         schema:
 *           type: object
 *           required:
 *             - chat_room_uid
 *             - target_uid
 *           properties:
 *             chat_room_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 채팅방 uid
 *             target_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 위임할 유저 uid
 *
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

    try{
        req.file_name = file_name;
        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};

            req.innerBody['item'] = await queryCheck(req, db_connection);
            if (!req.innerBody['item']) {
                errUtil.createCall(errCode.empty, `방장 권한이 없습니다.`);
                return;
            }

            req.innerBody['item'] = await queryUpdate(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'chat_room_uid');
}

function deleteBody(req) {
}



function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_user_check'
        , [
            req.headers['user_uid']
            , req.paramBody['chat_room_uid']
            , 1        // is_head      {0: false, 1: true}
        ]
    );
}


function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_chatroom_head'
        , [
            req.headers['user_uid']
          , req.paramBody['chat_room_uid']
          , req.paramBody['target_uid']
        ]
    );
}