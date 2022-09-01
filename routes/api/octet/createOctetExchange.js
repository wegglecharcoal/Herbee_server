/**
 * Created by gunucklee on 2021. 12. 03.
 *
 * @swagger 
 * /api/private/octet/exchange:
 *   post:
 *     summary: 옥텟 재화 교환 (Bee coin <-> 꿀)
 *     tags: [Octet]
 *     description: |
 *       path : /api/private/octet/exchange
 *
 *       * 옥텟 재화 교환 (Bee coin <-> 꿀)
 *
 *     parameters:
 *       - in: body
 *         name: body
 *         description: |
 *           옥텟 재화 교환 (Bee coin <-> 꿀)
 *         schema:
 *           type: object
 *           required:
 *             - type
 *             - amount
 *           properties:
 *             type:
 *               type: number
 *               example: 0
 *               description: |
 *                 교환할려는 타입
 *                 * 0: Bee coin -> 꿀
 *                 * 1: 꿀 -> Bee coin
 *             amount:
 *               type: number
 *               example: 5
 *               description: |
 *                 교환 개수
 *
 *     responses:
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

const fcmUtil = require('../../../common/utils/fcmUtil');
const octetUtil = require("../../../common/utils/octetUtil");
const errCode = require("../../../common/define/errCode");
const coinExchangeUtil = require("../../../common/utils/coinExchangeUtil");

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

            let check = await selectExchangeCheck(req, db_connection); //내가가진 꿀 소유량, 내가가진 코인 소유량 확인
            switch (req.paramBody['type']) {
                case 0: //꿀 -> Bee coin 스웨거 표시 문제. 0이 꿀을 비로 바꾸는거다
                    if(check['own_honey_amount'] < req.paramBody['amount']) { //소지한 꿀이 사용할 꿀보다 적으면
                        errUtil.createCall(errCode.non_enough_honey_1, `Error code: 403 [소지한 꿀 개수가 부족합니다.]`);
                        return;
                    }

                    if(req.paramBody['amount'] % 100 != 0){
                        errUtil.createCall(errCode.non_enough_honey_1, 'Error code: 403 [꿀과 비코인 환전비율을 100:1로 해야합니다.]')
                        return;
                    }

                    req.innerBody['bee_coin_exchange_rate'] = 0.01 //꿀 100개를 비코인 1개로 변경
                    break;
                case 1:  //Bee coin -> 꿀
                    if(check['own_bee_coin_amount'] < req.paramBody['amount']) { //소지한 비가 사용할 비보다 작으면
                        errUtil.createCall(errCode.non_enough_bee_coin, `Error code: 404 [소지한 BEE coin 개수가 부족합니다.]`);
                        return;
                    }

                    req.innerBody['bee_coin_exchange_rate'] = 100 //비코인 1개를 꿀 100개로 변경
                    break;
                default:
                    break;
            }

            // ** 꿀:비코인 환전비율은 100대 1로 진행한다. 기존 코인비율을 불러오지 않는다.
            // let bee_coin_info = await coinExchangeUtil.lBankSelectCoinRate('bee_usdt'); //비코인 비율 가져오기
            // if(bee_coin_info === 'false') {
            //     let db_bee_coin_info = await querySelectBeeCoinRate(bee_coin_info, db_connection); //못가져오면 디비 저장된 값으로 교환
            //     bee_coin_info = db_bee_coin_info['coin_rate']; //* 디비에도 비코인 비율 기록이 없다? 왜지? => 비율대로 교환 안하니 상관없나
            // } else {
            //     await queryUpdateBeeCoinRate(bee_coin_info, db_connection); //
            // }
            // req.innerBody['bee_coin_exchange_rate'] = Math.round(bee_coin_info * 100);

            req.innerBody['item'] =  await createOctetExchange(req, db_connection);//옥텍 교환 시작

            deleteBody(req);
            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }, function (err) {
            sendUtil.sendErrorPacket(req, res, err);
        });
    }
    catch (e) {
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}

function deleteBody(req) {
}

function checkParam(req) {
    paramUtil.checkParam_noReturn(req.paramBody, 'type');
    paramUtil.checkParam_noReturn(req.paramBody, 'amount');
}


function createOctetExchange(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_octet_exchange'
        , [
              req.headers['user_uid']
            , req.paramBody['type']
            , req.paramBody['amount']
            , req.innerBody['bee_coin_exchange_rate']

        ]
    );
}

function selectExchangeCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honey_octet_bee_coin'
        , [
              req.headers['user_uid']
        ]
    );
}


function querySelectBeeCoinRate(coin_rate, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_bee_coin_rate'
        , [
        ]
    );
}

function queryUpdateBeeCoinRate(coin_rate, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_bee_coin_rate'
        , [
            coin_rate
        ]
    );
}