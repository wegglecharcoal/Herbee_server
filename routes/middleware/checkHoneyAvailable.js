/**
 * Created by gunucklee on 2021. 10. 06.
 */
const paramUtil = require('../../common/utils/paramUtil');
const fileUtil = require('../../common/utils/fileUtil');
const mysqlUtil = require('../../common/utils/mysqlUtil');
const sendUtil = require('../../common/utils/sendUtil');
const errUtil = require('../../common/utils/errUtil');

const errCode = require('../../common/define/errCode');


let file_name = fileUtil.name(__filename);

module.exports = function (req, res, next) {
    const _funcName = arguments.callee.name;

    try {
        req.file_name = file_name;

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};
            let is_subscribe = await querySelectSubscribe(req, db_connection);

            if (!is_subscribe || !is_subscribe['end_subscribed']) {

                let ownHoney = await querySelectOwnHoney(req, db_connection);
                if(!ownHoney || 0 >= ownHoney['own_honey_amount'] ) {
                    errUtil.createCall(errCode.non_enough_honey_1, `Error code: 403 [소지한 꿀 개수가 부족합니다.]`);
                }

                let systemHoney = await querySelectSystemHoney(req, db_connection);
                if(!systemHoney) {
                    errUtil.createCall(errCode.non_exist_honey_kind, `Error code: 309 [찾을려는 꿀 종류가 존재하지 않습니다. 확인 해주세요.]`);
                }

                if(systemHoney['honey_amount'] > ownHoney['own_honey_amount']) {
                    errUtil.createCall(errCode.non_enough_honey_2, `Error code: 457 [사용할 수 있는 꿀이 모자라요 ㅠㅠ]`);
                }

            }



            next();

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
    if(!paramUtil.checkParam_return(req.headers, 'manual_code')) {
        errUtil.createCall(errCode.non_exist_manual_code, `Error code: 310 [꿀 메뉴얼 코드가 비어있습니다. 헤더에 'manual_code' 코드 값을 넣어주세요.]`);
    }
}


function querySelectSubscribe(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_is_subscribe'
        , [
            req.headers['user_uid']
        ]
    )
}


function querySelectOwnHoney(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honey'
        , [
            req.headers['user_uid']
        ]
    )
}

function querySelectSystemHoney(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_honey_system'
        , [
            req.headers['manual_code']
        ]
    )
}