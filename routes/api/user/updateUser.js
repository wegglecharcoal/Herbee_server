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
 *             - nickname
 *             - birth
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
 *             height:
 *               type: integer
 *               example: 169
 *               description: 키
 *             drink:
 *               type: integer
 *               example: 0
 *               description: |
 *                 음주
 *                 * 0: 선택 안함
 *                 * 1: 알콜 쓰레기에요
 *                 * 2: 딱히 잘 안 마셔요
 *                 * 3: 가끔 마셔요
 *                 * 4: 적당히 즐기면서 마셔요
 *                 * 5: 많이 즐겨 마셔요
 *               enum: [0,1,2,3,4,5]
 *             smoking:
 *               type: integer
 *               example: 0
 *               description: |
 *                 음주
 *                 * 0: 선택 안함
 *                 * 1: 전혀 피우지 않아요
 *                 * 2: 가끔 피워요
 *                 * 3: 흡연자에요
 *               enum: [0,1,2,3]
 *             education:
 *               type: integer
 *               example: 0
 *               description: |
 *                 학력
 *                 * 0: 비공개
 *                 * 1: 고등학교 졸업
 *                 * 2: 대학교 2년제
 *                 * 3: 대학교 4년제
 *                 * 4: 대학원
 *               enum: [0,1,2,3,4]
 *             job:
 *               type: string
 *               example: '나무꾼'
 *               description: 직업
 *             introduce:
 *               type: string
 *               example: '안녕하세요. 이건욱입니다. 여름이였다..'
 *               description: 자기소개
 *             birth:
 *               type: string
 *               example: '1996-08-02'
 *               description: 생년월일
 *            language:
 *               type: string
 *               example: 'ko'
 *               description: |
 *                 언어설정
 *                 * ko: 한글
 *                 * en: 영어
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
    paramUtil.checkParam_noReturn(req.paramBody, 'filename');
    paramUtil.checkParam_noReturn(req.paramBody, 'nickname');
    paramUtil.checkParam_noReturn(req.paramBody, 'birth');
}

function deleteBody(req) {
}


function queryUpdate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_user'
        , [
              req.headers['user_uid']
            , req.paramBody['filename']
            , req.paramBody['email']
            , req.paramBody['phone']
            , req.paramBody['nickname']
            , req.paramBody['height']
            , req.paramBody['drink']
            , req.paramBody['smoking']
            , req.paramBody['education']
            , req.paramBody['job']
            , req.paramBody['introduce']
            , req.paramBody['birth']
            , req.paramBody['language']
        ]
    );
}