/**
 * Created by gunucklee on 2021. 09. 27.
 *
 * @swagger
 * /api/private/honeyManual:
 *   get:
 *     summary: 꿀 메뉴얼
 *     tags: [Honey]
 *     description: |
 *       path : /api/private/honeyManual
 *
 *       * 꿀 메뉴얼
 *
 *       * 무료
 *       H0-001: 피드업로드 사진/글
 *       H0-002: 피드업로드 동영상
 *       H0-003: 만남인증
 *       H0-004: 동네후기
 *
 *       * 지불
 *       H1-001: 메시지
 *       H1-002: 약속 장소 잡기
 *       H1-003: 대화방 살리기
 *       H1-004: 동네모임 개설
 *       H1-005: 동네모임 가입
 *       H1-006: 만남 지역 넓히기
 *
 *       * 환불
 *       H2-001: 약속 장소 잡기
 *       H2-002: 대화방 살리기
 *
 *
 *     parameters:
 *       - in: query
 *         name: manual_code
 *         default: 0
 *         required: true
 *         schema:
 *           type: number
 *           example: 0
 *         description: |
 *           검색할 꿀 메뉴얼 코드
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

            req.innerBody['item'] = await querySelect(req, db_connection);


            deleteBody(req);
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
    paramUtil.checkParam_noReturn(req.paramBody, 'manual_code');
}

function deleteBody(req) {
}

function querySelect(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honeyManual'
        , [
            req.paramBody['manual_code']
        ]
    );
}
