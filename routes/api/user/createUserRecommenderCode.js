/**
 * Created by gunucklee on 2021. 12. 22.
 *
 * @swagger
 * /api/private/user/recommender/code:
 *   post:
 *     summary: 상대방 추천인 코드 입력하기
 *     tags: [User]
 *     description: |
 *       path : /api/private/user/recommender/code
 *
 *       * 상대방 추천인 코드 입력
 *       * 입력 시 상대방과 입력한 본인에게 10꿀씩 지급
 *
 *
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           회원가입
 *         schema:
 *           type: object
 *           required:
 *             - recommender_code
 *           properties:
 *             recommender_code:
 *               type: string
 *               example: 'JAOK8V'
 *               description: 추천인 코드
 *
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
const octetUtil = require('../../../common/utils/octetUtil');

const errCode = require('../../../common/define/errCode');

let file_name = fileUtil.name(__filename);

module.exports = function (req, res) {
    const _funcName = arguments.callee.name;

    try {
        req.file_name = file_name;

        req.paramBody = paramUtil.parse(req);

        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};


            let checkCodeExist = await queryCheckRecommenderCodeExist(req, db_connection);
            let checkAlreadyRecommend = await queryCheckRecommenderCodeAlready(req, db_connection);

            if(!checkCodeExist) {
                errUtil.createCall(errCode.empty, `추천 코드가 존재하지 않습니다. 다시 시도해주세요.`);
                return;
            }
            else if(checkAlreadyRecommend['recommendee_code'] !== null) {
                errUtil.createCall(errCode.empty, `이미 추천인 코드를 입력했습니다`);
                return;
            }



            let result = await queryCreate(req, db_connection);

            if(result) {
                req.innerBody['success'] = 1;
            }
            else {
                req.innerBody['success'] = 0;
            }
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
    paramUtil.checkParam_noReturn(req.paramBody, 'recommender_code');
}

function deleteBody(req) {
}

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_user_recommender_code'
        , [
             req.headers['user_uid']
           , req.paramBody['recommender_code']
        ]
    );
}


function queryCheckRecommenderCodeExist(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_recommender_code_check'
        , [
              req.headers['user_uid']
            , req.paramBody['recommender_code']
        ]
    );
}


function queryCheckRecommenderCodeAlready(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_recommender_code_already_check'
        , [
            req.headers['user_uid']
        ]
    );
}
