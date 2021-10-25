/**
 * Created by gunucklee on 2021. 10. 05.
 *
 * @swagger
 * /api/private/chatRoom/gathering:
 *   post:
 *     summary: 모임 채팅방 생성
 *     tags: [ChatRoom]
 *     description: |
 *       path : /api/private/chatRoom/gathering
 *
 *       * 모임 채팅방 생성
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           모임 채팅방 생성
 *         schema:
 *           type: object
 *           required:
 *             - gathering_interests
 *             - gathering_name
 *             - gathering_description
 *             - is_gender_ratio
 *             - male_ratio
 *             - female_ratio
 *             - filename
 *             - address
 *             - latitude
 *             - longitude
 *           properties:
 *             gathering_interests:
 *               type: number
 *               description: |
 *                 모임 관심사
 *                 * 0: 운동
 *                 * 1: 스터디
 *                 * 2: 맛집 탐방
 *                 * 3: 독서
 *                 * 4: 영화
 *                 * 5: 여행
 *                 * 6: 전시/공연
 *                 * 7: 악기
 *                 * 8: 기타
 *             gathering_name:
 *               type: string
 *               description: |
 *                 모임 이름
 *             gathering_description:
 *               type: string
 *               description: |
 *                 모임 설명
 *             gathering_member:
 *               type: number
 *               description: |
 *                 모임 인원 수
 *             male_ratio:
 *               type: number
 *               description: |
 *                 남성 인원 수
 *                 * 0: false
 *                 * 1: true
 *             female_ratio:
 *               type: number
 *               description: |
 *                 여성 인원 수
 *                 * 0: false
 *                 * 1: true
 *             filename:
 *               type: string
 *               description: |
 *                 모임 커버 이미지
 *             address:
 *               type: string
 *               description: |
 *                 모임 장소
 *             latitude:
 *               type: number
 *               description: |
 *                 위도
 *             longitude:
 *               type: number
 *               description: |
 *                 경도
 *
 *           example:
 *             gathering_interests: 1
 *             gathering_name: 주말 영어 학습반
 *             gathering_description: 주말 영어 학습반입니다. 화려한 조명이 나를 감싸네요.
 *             gathering_member: 13
 *             is_gender_ratio: 1
 *             male_ratio: 7
 *             female_ratio: 6
 *             filename: abnao34ewogwegrwgp3o42ghmsdf.jpg
 *             address: 부산시 수영구 망미로 21번길 5
 *             latitude: 37.5662952
 *             longitude: 126.9773966
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
const fcmUtil = require('../../../common/utils/fcmUtil');

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
            // paramUtil.checkParam_alreadyUse(check,'이미 해당 채팅방이 등록되어 있습니다.');

            req.innerBody['item'] = await queryCreateChatRoom(req, db_connection);

            // FCM 기능 추후 반영 예정
            // if(req.headers['user_uid'] !== req.innerBody['item']['video_user_uid'])
            //     await fcmUtil.fcmVideoCommentSingle(req.innerBody['item'])

            deleteBody(req)
            await queryCreateUseHoney(req, db_connection);
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
    paramUtil.checkParam_noReturn(req.paramBody, 'gathering_interests');
    paramUtil.checkParam_noReturn(req.paramBody, 'gathering_name');
    paramUtil.checkParam_noReturn(req.paramBody, 'gathering_description');
    paramUtil.checkParam_noReturn(req.paramBody, 'gathering_member');
    paramUtil.checkParam_noReturn(req.paramBody, 'is_gender_ratio');
    paramUtil.checkParam_noReturn(req.paramBody, 'male_ratio');
    paramUtil.checkParam_noReturn(req.paramBody, 'female_ratio');
    paramUtil.checkParam_noReturn(req.paramBody, 'filename');
    paramUtil.checkParam_noReturn(req.paramBody, 'address');
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');


}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_chatRoom_general_check'
        , [
            req.headers['user_uid']
          , req.paramBody['target_uid']
          , req.paramBody['type']
          , req.paramBody['content']
        ]
    );
}



function queryCreateChatRoom(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_chatRoom_gathering'
        , [
              req.headers['user_uid']
            , 1                       // 채팅방 타입 1: 모임 채팅
            , req.paramBody['gathering_interests']
            , req.paramBody['gathering_name']
            , req.paramBody['gathering_description']
            , req.paramBody['gathering_member']
            , req.paramBody['is_gender_ratio']
            , req.paramBody['male_ratio']
            , req.paramBody['female_ratio']
            , req.paramBody['filename']
            , req.paramBody['address']
            , req.paramBody['latitude']
            , req.paramBody['longitude']
        ]
    );
}

function queryCreateUseHoney(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_use_honey'
        , [
            req.headers['user_uid']
            , req.headers['manual_code']
        ]
    );
}