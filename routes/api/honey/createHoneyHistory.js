/**
 * Created by gunucklee on 2021. 09. 27.
 *
 * @swagger
 * /api/private/honeyHistory:
 *   post:
 *     summary: 꿀 내역 생성
 *     tags: [Honey]
 *     description: |
 *       path : /api/private/honeyHistory
 *
 *       * 꿀 내역 생성
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           꿀 내역 생성
 *         schema:
 *           type: object
 *           required:
 *             - type
 *             - payment
 *             - honey_amount
 *           properties:
 *             type:
 *               type: number
 *               description: |
 *                 타겟 uid
 *                 * 0: 사용
 *                 * 1: 결제
 *
 *                 * 10: 동영상 무료
 *                 * 11: 사진 무료
 *                 * 12: 만남 인증 무료
 *                 * 13: 동네 후기 무료
 *
 *                 * 20: 취소
 *             payment:
 *               type: number
 *               description: |
 *                 결제금액
 *             honey_amount:
 *               type: string
 *               description: |
 *                 꿀 개수
 *                 양수: 결제로 인한 꿀 획득
 *                 음수: 사용으로 인한 꿀 소비
 *
 *           example:
 *             type: 1
 *             payment: 24000
 *             honey_amount: 300
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

            // let check = await queryCheck(req, db_connection);
            // paramUtil.checkParam_alreadyUse(check,'이미 해당 꿀 기록이 등록되어 있습니다.');

            req.innerBody['item'] = await queryCreate(req, db_connection);

            deleteBody(req)
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
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'payment');
    paramUtil.checkParam_noReturn(req.paramBody, 'honey_amount');
}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honeyHistory_check'
        , [
            req.headers['user_uid']
          , req.paramBody['type']
          , req.paramBody['payment']
          , req.paramBody['honey_amount']
        ]
    );
}



function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_honeyHistory'
        , [
            req.headers['user_uid']
          , req.paramBody['type']
          , req.paramBody['payment']
          , req.paramBody['honey_amount']
          , '결제'  // 추후 무조건 수정해야 함
        ]
    );
}



