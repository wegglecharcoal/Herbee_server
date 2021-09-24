/**
 * Created by gunucklee on 2021. 09. 23.
 *
 * @swagger
 * /api/private/localReview:
 *   post:
 *     summary: 동네 후기 생성
 *     tags: [LocalReview]
 *     description: |
 *       path : /api/private/localReview
 *
 *       * 동네 후기 생성
 *       * 해당 api 호출 전 필수 사항
 *         : 파일 업로드 => /api/public/file
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           동네 후기 생성
 *         schema:
 *           type: object
 *           required:
 *             - address
 *             - building_name
 *             - latitude
 *             - longitude
 *             - filename
 *             - content
 *             - file_type
 *           properties:
 *             address:
 *               type: string
 *               description: |
 *                 동네 후기 장소
 *             building_name:
 *               type: string
 *               description: |
 *                 빌딩 이름
 *             latitude:
 *               type: number
 *               description: |
 *                 위도
 *             longitude:
 *               type: number
 *               description: |
 *                 경도
 *             filename:
 *               type: string
 *               description: |
 *                 동네후기 파일명
 *             video_thumbnail:
 *               type: string
 *               description: |
 *                 비디오 썸네일 이미지
 *                 * file_type === 1 일 때만 해당 값이 있음
 *                 * 0: 이미지
 *                 * 1: 동영상
 *             content:
 *               type: string
 *               description: |
 *                 내용
 *             file_type:
 *               type: number
 *               description: |
 *                 파일 타입
 *                 * 0: 이미지
 *                 * 1: 동영상
 *
 *           example:
 *             address: 부산시 수영구 망미로 21번길 13
 *             building_name: 공룡 슈퍼마켓
 *             latitude: 37.5662952
 *             longitude: 126.9773966
 *             filename: 9b13814590836adbfa54eed1fe96b449.mp4
 *             video_thumbnail: 34ac0322b56b2a558bfa655bd8f56d3aThumbnail.0000000.jpg
 *             content: 라이프 스타일 테스트 댓글 입니다.
 *             file_type: 1
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

            let check = await queryCheck(req, db_connection);
            paramUtil.checkParam_alreadyUse(check,'이미 해당 동네 후기가 등록되어 있습니다.');

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
    paramUtil.checkParam_noReturn(req.paramBody, 'address');
    paramUtil.checkParam_noReturn(req.paramBody, 'building_name');
    paramUtil.checkParam_noReturn(req.paramBody, 'latitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'longitude');
    paramUtil.checkParam_noReturn(req.paramBody, 'filename');
    paramUtil.checkParam_noReturn(req.paramBody, 'content');
    paramUtil.checkParam_noReturn(req.paramBody, 'file_type');
}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_localReview_check'
        , [
            req.headers['user_uid']
          , req.paramBody['address']
          , req.paramBody['building_name']
          , req.paramBody['latitude']
          , req.paramBody['longitude']
          , req.paramBody['filename']
          , req.paramBody['video_thumbnail']
          , req.paramBody['content']
          , req.paramBody['file_type']
        ]
    );
}


function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_localReview'
        , [
              req.headers['user_uid']
            , req.paramBody['address']
            , req.paramBody['building_name']
            , req.paramBody['latitude']
            , req.paramBody['longitude']
            , req.paramBody['filename']
            , req.paramBody['video_thumbnail']
            , req.paramBody['content']
            , req.paramBody['file_type']
        ]
    );
}



