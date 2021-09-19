/**
 * Created by gunucklee on 2021. 09. 17.
 *
 * @swagger
 * /api/private/Report:
 *   post:
 *     summary: 신고 하기
 *     tags: [Report]
 *     description: |
 *       path : /api/private/Report
 *
 *       * 신고 하기
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           신고 하기
 *         schema:
 *           type: object
 *           required:
 *             - target_uid
 *             - type
 *             - status
 *           properties:
 *             target_uid:
 *               type: number
 *               example: 1
 *               description: |
 *                 신고 당하는 uid
 *                 * 0: 유저 신고 => 유저 uid
 *                 * 1: 라이프스타일 신고 => 라이프스타일 uid
 *                 * 2: 동네후기 신고 => 동네후기 uid
 *                 * 3: 댓글 신고 => 댓글 uid
 *                 * 4: 대댓글 신고 => 대댓글 uid
 *                 * 5: 채팅 신고 => 채팅 uid
 *             type:
 *               type: number
 *               example: 0
 *               description: |
 *                 신고 타입
 *                 * 0: 유저 신고
 *                 * 1: 라이프스타일 신고
 *                 * 2: 동네후기 신고
 *                 * 3: 댓글 신고
 *                 * 4: 대댓글 신고
 *                 * 5: 채팅 신고
 *             status:
 *               type: number
 *               example: 0
 *               description: |
 *                 신고 상태
 *                 * 0: 스팸
 *                 * 1: 나체 이미지 또는 성적 행위
 *                 * 2: 혐오 발언 또는 상징
 *                 * 3: 불법적 행위
 *                 * 4: 사진 / 동영상 도용
 *                 * 5: 기타
 *             report_reason:
 *               type: string
 *               example: '너무...화가나요오오옷 끼이이에에에엑!!!!!'
 *               description: |
 *                 신고 이유
 *             filename:
 *               type: string
 *               example: 'fem2wefwmpeofmwef.jpg'
 *               description: |
 *                 신고 이미지
 *
 *
 *     responses:
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

            let check = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(check,'이미 해당 신고가 등록되어 있습니다.');

            req.innerBody['item'] = await queryCreate(req, db_connection);

            deleteBody(req);
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });
    }
    catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}

function deleteBody(req) {
}

function checkParam(req) {
    paramUtil.checkParam_noReturn(req.paramBody, 'target_uid');
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'status');
}


function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_report_check'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['status']
        ]
    );
}


function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_report'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['status']
          , req.paramBody['report_reason']
          , req.paramBody['filename']
        ]
    );
}
