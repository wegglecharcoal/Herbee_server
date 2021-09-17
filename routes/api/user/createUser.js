/**
 * Created by gunucklee on 2021. 09. 10.
 *
 * @swagger
 * /api/public/user/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [User]
 *     description: |
 *       path : /api/public/user/signup
 *
 *       * 회원가입
 *       * 해당 api 호출 전 필수 사항
 *         : 회원가입 여부 체크 필요 => /api/public/user/signup/check
 *         : 이미지 업로드 => /api/public/file
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
 *             - filename
 *             - email
 *             - phone
 *             - nickname
 *             - push_token
 *             - social_id
 *             - signup_type
 *             - os
 *             - version_app
 *             - birth
 *             - gender
 *             - address
 *             - latitude
 *             - longitude
 *           properties:
 *             filename:
 *               type: string
 *               example: 'fd70d8023a175e7cfdbdfd714346bab2.jpeg'
 *               description: |
 *                 프로필 사진
 *                 * /api/public/file api 호출뒤 응답값인 filename 를 사용
 *             email:
 *               type: string
 *               example: 'test@email.com'
 *               description: 이메일
 *             phone:
 *               type: string
 *               example: '01042474682'
 *               description: 연락처
 *             nickname:
 *               type: string
 *               example: '귀여운다람쥐'
 *               description: 닉네임
 *             push_token:
 *               type: string
 *               example: 'fVQYfTSVSI68pekYV4RlmX:APA91bHeJzNSoU55FrMfN7X90vp0Z3-SKZqGXHBPHRwB4DMipbVQAfZXZuhlTdOYTONazFHWcrS0SSvxoQeE3uDnGuZnlUZ_tcLmy8R41jJ4HWUTCJsvnr1i7w2K2hbrhqwdqIEJ_'
 *               description: fcm 푸시 token
 *             social_id:
 *               type: string
 *               example: 'kakao_a1234567890'
 *               description: 소셜 id
 *             signup_type:
 *               type: string
 *               example: 'kakao'
 *               description: |
 *                 회원가입 타입
 *                 * kakao: 카카오
 *                 * naver: 네이버
 *                 * google: 구글
 *                 * apple: 애플
 *               enum: [kakao,naver,google,apple]
 *             os:
 *               type: string
 *               example: 'ANDROID'
 *               description: |
 *                 디바이스 운영체제
 *               enum: [ANDROID, IOS]
 *             version_app:
 *               type: string
 *               example: '0.0.1'
 *               description: |
 *                 헐비 앱 버전
 *                 * ex - 0.0.1
 *             birth:
 *               type: string
 *               example: '1996-08-02'
 *               description: 생년월일
 *             gender:
 *               type: integer
 *               example: 0
 *               description: |
 *                  성별
 *                  * 0: 남성
 *                  * 1: 여성
 *               enum: [0,1]
 *             address:
 *               type: string
 *               example: 서울 강남구 봉천동 28-10
 *               description: 주소
 *             latitude:
 *               type: number
 *               example: 37.5662952
 *               description: 위도
 *             longitude:
 *               type: number
 *               example: 126.9773966
 *               description: 경도
 *             is_alert:
 *               type: integer
 *               example: 1
 *               description: |
 *                 알림 수신 여부 (팔로워, 좋아요, 댓글, 하루문답, 약속)
 *                 IOS 만 알림 수신여부에 대한 값을 파라미터로 받습니다.
 *                 ( 안드는 default 1 )
 *                 * 0: false
 *                 * 1: true
 *               enum: [0,1]
 *             is_alert_marketing:
 *               type: integer
 *               example: 1
 *               description: |
 *                 마케팅 알림 수신 여부
 *                 * 0: false
 *                 * 1: true
 *               enum: [0,1]
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
        logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);
        req.paramBody = paramUtil.parse(req);

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};


            const user_data = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(user_data, '이미 회원가입한 유저 입니다.');

            const email_data = await queryCheckEmail(req, db_connection);
            paramUtil.checkParam_alreadyUse(email_data, '이미 가입한 이메일 입니다.');

            const nickname_data = await queryCheckNickname(req, db_connection);
            paramUtil.checkParam_alreadyUse(nickname_data, '이미 사용 중인 닉네임 입니다.');


            req.innerBody['item'] = await queryCreate(req, db_connection);
            console.log("JSON" + JSON.stringify(req.innerBody['item']['uid']));
            req.innerBody['item']['access_token'] = jwtUtil.createToken(req.innerBody['item'], '100d');

            console.log("asodaispo")
            await queryUpdate(req, db_connection);

            console.log("da" +
                "")
            await queryCreateAddress(req, db_connection);



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
    paramUtil.checkParam_noReturn(req.paramBody, 'filename');
    paramUtil.checkParam_noReturn(req.paramBody, 'email');
    paramUtil.checkParam_noReturn(req.paramBody, 'phone');
    paramUtil.checkParam_noReturn(req.paramBody, 'nickname');
    paramUtil.checkParam_noReturn(req.paramBody, 'push_token');
    paramUtil.checkParam_noReturn(req.paramBody, 'social_id');
    paramUtil.checkParam_noReturn(req.paramBody, 'signup_type');
    paramUtil.checkParam_noReturn(req.paramBody, 'os');
    paramUtil.checkParam_noReturn(req.paramBody, 'version_app');
    paramUtil.checkParam_noReturn(req.paramBody, 'birth');
    paramUtil.checkParam_noReturn(req.paramBody, 'gender');
    paramUtil.checkParam_noReturn(req.paramBody, 'address');
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'is_alert');
    paramUtil.checkParam_noReturn(req.paramBody, 'is_alert_marketing');
}

function deleteBody(req) {
    // delete req.innerBody['test']['test'];
}

function alreadyUse(item, errMsg) {
    if( item ) {
        errUtil.createCall(errCode.already, errMsg);
        return true;
    }
    return false;

    // if( alreadyUse(user_data, '이미 회원가입한 유저 입니다.') ) {
    //     return;
    // }
}

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_user'
        , [
            req.paramBody['filename']
          , req.paramBody['email']
          , req.paramBody['phone']
          , req.paramBody['nickname']
          , req.paramBody['push_token']
          , req.paramBody['social_id']
          , req.paramBody['signup_type']
          , req.paramBody['os']
          , req.paramBody['version_app']
          , req.paramBody['birth']
          , req.paramBody['gender']
          , req.paramBody['is_alert']
          , req.paramBody['is_alert_marketing']
        ]
    );
}

function queryCreateAddress(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_address_book'
        , [
            req.headers['user_uid']
          , req.paramBody['address']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
          , 1  // is_default 기본 주소  0: false   1: true
        ])
}

function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    console.log("durl?")
    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_user_access_token'
        , [
            req.innerBody['item']['uid']
          , req.innerBody['item']['access_token']
        ]
    );
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_signup_check'
        , [
            req.paramBody['signup_type']
          , req.paramBody['social_id']
        ]
    );
}

function queryCheckEmail(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_email_check'
        , [
              req.headers['user_uid']
            , req.paramBody['email']
        ]
    );
}

function queryCheckNickname(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_nickname_check'
        , [
            req.headers['user_uid']
          , req.paramBody['nickname']
        ]
    );
}



