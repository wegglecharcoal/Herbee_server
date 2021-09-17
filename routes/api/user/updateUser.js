/**
 * Created by gunucklee on 2021. 09. 13.
 *
 * @swagger
 * /api/private/user:
 *   put:
 *     summary: 유저 정보 수정
 *     tags: [User]
 *     description: |
 *       path : /api/private/user
 *
 *       * 유저 정보 수정
 *       * 해당 api 호출 전 필수 사항
 *         : 이미지 업로드 => /api/public/file
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           유저 정보 수정
 *         schema:
 *           type: object
 *           required:
 *             - filename
 *             - email
 *             - phone
 *             - nickname
 *             - height
 *             - drink
 *             - smoking
 *             - education
 *             - job
 *             - introduce
 *             - birth
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
 *             introduce:
 *               type: string
 *               example: '안녕하세요. 이건욱입니다. 여름이였다..'
 *               description: 자기소개
 *             birth:
 *               type: string
 *               example: '1996-08-02'
 *               description: 자기소개
 *             address:
 *               type: string
 *               example: '안녕하세요. 이건욱입니다. 여름이였다..'
 *               description: 자기소개
 *             latitude:
 *               type: number
 *               example: 37.5662952
 *               description: 위도
 *             longitude:
 *               type: number
 *               example: 126.9773966
 *               description: 경도
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

const errCode = require('../../../common/define/errCode');
const jwtUtil = require("../../../common/utils/jwtUtil");

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
            paramUtil.checkParam_alreadyUse(nickname_data, '이미 사용 중인 닉네임 입니다.');/**/


            req.innerBody['item'] = await queryCreate(req, db_connection);


            await queryUpdate(req, db_connection);

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
    paramUtil.checkParam_noReturn(req.paramBody, 'sign_type');
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
            , req.paramBody['sign_type']
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



