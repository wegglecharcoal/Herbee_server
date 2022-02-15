/**
 * Created by gunucklee on 2021. 09. 14.
 *
 * @swagger
 * /api/public/user/signup/check:
 *   get:
 *     summary: 로그인 / 유저 회원가입 여부 체크
 *     tags: [User]
 *     description: |
 *       path : /api/public/user/signup/check
 *
 *       * 회원가입 여부 체크
 *       * 해당 api는 로그인 역활도 수행함
 *       * 이미 회원가입된 유저의 경우 해당 api를 호출한뒤 응닶값인 access_token 값을 header에 업데이트해 주세요
 *
 *     parameters:
 *       - in: query
 *         name: push_token
 *         default: fVQYfTSVSI68pekYV4RlmX:APA91bHeJzNSoU55FrMfN7X90vp0Z3-SKZqGXHBPHRwB4DMipbVQAfZXZuhlTdOYTONazFHWcrS0SSvxoQeE3uDnGuZnlUZ_tcLmy8R41jJ4HWUTCJsvnr1i7w2K2hbrhqwdqIEJ_
 *         required: true
 *         schema:
 *           type: string
 *           example: fVQYfTSVSI68pekYV4RlmX:APA91bHeJzNSoU55FrMfN7X90vp0Z3-SKZqGXHBPHRwB4DMipbVQAfZXZuhlTdOYTONazFHWcrS0SSvxoQeE3uDnGuZnlUZ_tcLmy8R41jJ4HWUTCJsvnr1i7w2K2hbrhqwdqIEJ_
 *         description: |
 *           fcm 푸시 token
 *       - in: query
 *         name: social_id
 *         default: kakao_a1234567890
 *         required: true
 *         schema:
 *           type: string
 *           example: kakao_a1234567890
 *         description: |
 *           소셜 id
 *       - in: query
 *         name: signup_type
 *         default: kakao
 *         required: true
 *         schema:
 *           type: string
 *           example: kakao
 *         description: |
 *           회원가입 타입
 *           * kakao: 카카오
 *           * naver: 네이버
 *           * google: 구글
 *           * apple: 애플
 *         enum: [kakao,naver,google,apple]
 *       - in: query
 *         name: os
 *         default: ANDROID
 *         required: true
 *         schema:
 *           type: string
 *           example: ANDROID
 *         description: |
 *           디바이스 운영체제
 *         enum: [ANDROID, IOS]
 *       - in: query
 *         name: version_app
 *         default: 0.0.0
 *         required: true
 *         schema:
 *           type: string
 *           example: 0.0.1
 *         description: |
 *           위글 앱 버전
 *           * ex - 0.0.1
 *      - in: query
 *         name: language
 *         default: 'kr'
 *         required: true
 *         schema:
 *           type: string
 *           example: 'kr'
 *         description: |
 *           사용하는 언어
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

const errCode = require('../../../common/define/errCode');

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

            req.innerBody['item'] = await queryCheck(req, db_connection);
            if (!req.innerBody['item']) {
                errUtil.createCall(errCode.non_exist_user, `Error code: 307 [회원가입하지 않은 유저입니다.]`);
                return;
            }

            req.innerBody['item']['access_token'] = jwtUtil.createToken(req.innerBody['item'], '100d');
            req.innerBody['item'] = await queryUpdate(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'signup_type');
    paramUtil.checkParam_noReturn(req.paramBody, 'social_id');
    // paramUtil.checkParam_noReturn(req.paramBody, 'push_token');
    paramUtil.checkParam_noReturn(req.paramBody, 'os');
    paramUtil.checkParam_noReturn(req.paramBody, 'version_app');
}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_signup_check'
        , [
            req.paramBody['signup_type']
          , req.paramBody['social_id']
        ])
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_user_login'
        , [
            req.innerBody['item']['uid'],
            req.innerBody['item']['access_token'],

            req.paramBody['push_token'],
            req.paramBody['os'],
            req.paramBody['version_app'],
            req.paramBody['language']
        ]);
}