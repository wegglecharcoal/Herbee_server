/**
 * Created by gunucklee on 2021. 10. 12.
 *
 * @swagger
 * /api/private/chatRoom/recentMsg:
 *   put:
 *     summary: 최근 메시지 업데이트
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/recentMsg
 *
 *       * 최근 메시지 업데이트
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           최근 메시지 업데이트
 *         schema:
 *           type: object
 *           required:
 *             - chat_room_uid
 *             - recent_msg
 *           properties:
 *             chat_room_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 채팅방 uid
 *             recent_msg:
 *               type: string
 *               example: 머해 자니?
 *               description: |
 *                 최근 메시지
 *
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
    paramUtil.checkParam_noReturn(req.paramBody, 'recent_msg');
}

function deleteBody(req) {
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_recent_msg'
        , [
            req.paramBody['chat_room_uid']
          , req.paramBody['recent_msg']
        ]
    );
}
