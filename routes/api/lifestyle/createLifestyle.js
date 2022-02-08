/**
 * Created by gunucklee on 2021. 09. 23.
 *
 * @swagger
 * /api/private/lifestyle:
 *   post:
 *     summary: 라이프스타일 생성
 *     tags: [Lifestyle]
 *     description: |
 *       path : /api/private/lifestyle
 *
 *       * 라이프스타일 생성
 *       * 해당 api 호출 전 필수 사항
 *         : 파일 업로드 => /api/public/file
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           라이프스타일 생성
 *         schema:
 *           type: object
 *           required:
 *             - filename
 *             - video_thumbnail
 *             - content
 *             - file_type
 *             - is_balance_game
 *             - type
 *             - balance_game_question_uid
 *             - answer_type
 *           properties:
 *             filename:
 *               type: string
 *               description: |
 *                 라이프스타일 파일명
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
 *             is_balance_game:
 *               type: number
 *               description: |
 *                 밸런스 게임 여부
 *                 * 0: false
 *                 * 1: true
 *             type:
 *               type: number
 *               description: |
 *                 밸런스 게임 타입
 *                 * 0: 영상 밸런스게임
 *                 * 1: 1일 접속 랜덤 밸런스게임
 *                 * 2: 채팅방 랜덤 밸런스게임
 *             balance_game_question_uid:
 *               type: number
 *               description: |
 *                 밸런스 게임 질문 uid
 *             answer_type:
 *               type: number
 *               description: |
 *                 밸런스 게임 답
 *                 * 0: answer_a 선택
 *                 * 1: answer_b 선택
 *
 *
 *           example:
 *             filename: 9b13814590836adbfa54eed1fe96b449.mp4
 *             video_thumbnail: 34ac0322b56b2a558bfa655bd8f56d3aThumbnail.0000000.jpg
 *             content: 라이프 스타일 테스트 댓글 입니다.
 *             file_type: 1
 *             is_balance_game: 1
 *             type: 0
 *             balance_game_question_uid: 5
 *             answer_type: 1
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
const errCode = require("../../../common/define/errCode");

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

            paramUtil.checkParam_alreadyUse(check, errCode.already_lifestyle,'Error code: 504 [이미 해당 라이프스타일이 등록되어 있습니다.]');

            req.innerBody['item'] = await queryCreateLifestyle(req, db_connection);


            if(req.paramBody['is_balance_game'] === 1) {
                await queryCreateBalanceGame(req, db_connection);
            }


            if(req.paramBody['file_type'] === 0) {
                req.innerBody['manual_code'] = 'H0-001';
                let system_honey = await querySelectHoneySystem(req, db_connection);
                system_honey['user_uid'] = req.headers['user_uid'];
                system_honey['type'] = 10; // type 10: 동영상 무료
                await queryCreateHoney(system_honey, db_connection);
            }
            else if(req.paramBody['file_type'] === 1) {
                req.innerBody['manual_code'] = 'H0-002';
                let system_honey = await querySelectHoneySystem(req, db_connection);
                system_honey['user_uid'] = req.headers['user_uid'];
                system_honey['type'] = 11; // type 11: 사진 무료
                await queryCreateHoney(system_honey, db_connection);
            }

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
    paramUtil.checkParam_noReturn(req.paramBody, 'filename');
    paramUtil.checkParam_noReturn(req.paramBody, 'content');
    paramUtil.checkParam_noReturn(req.paramBody, 'file_type');

    if(req.paramBody['is_balance_game'] === 1) {
        paramUtil.checkParam_noReturn(req.paramBody, 'type');
        paramUtil.checkParam_noReturn(req.paramBody, 'balance_game_question_uid');
        paramUtil.checkParam_noReturn(req.paramBody, 'answer_type');
    }
}

function deleteBody(req) {
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_lifestyle_check'
        , [
              req.headers['user_uid']
            , req.paramBody['filename']
            , req.paramBody['content']
            , req.paramBody['file_type']
        ]
    );
}


function queryCreateLifestyle(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_lifestyle'
        , [
              req.headers['user_uid']
            , req.paramBody['filename']
            , req.paramBody['video_thumbnail']
            , req.paramBody['content']
            , req.paramBody['file_type']
            , req.paramBody['is_balance_game']
        ]
    );
}




function queryCreateBalanceGame(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_balance_game'
        , [
              req.headers['user_uid']
            , req.innerBody['item']['uid']
            , req.paramBody['type']
            , req.paramBody['balance_game_question_uid']
            , req.paramBody['answer_type']
        ]
    );
}



function querySelectHoneySystem(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honey_system'
        , [
            req.innerBody['manual_code']
        ]
    );
}


function queryCreateHoney(system_honey, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_honeyHistory'
        , [
              system_honey['user_uid']
            , system_honey['type']
            , 0   // payment
            , system_honey['honey_amount']
            , system_honey['title']
        ]
    );
}

