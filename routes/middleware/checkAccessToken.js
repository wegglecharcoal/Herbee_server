/**
 * Created by gunucklee on 2021. 09. 14.
 */
const paramUtil = require('../../common/utils/paramUtil');
const fileUtil = require('../../common/utils/fileUtil');
const mysqlUtil = require('../../common/utils/mysqlUtil');
const sendUtil = require('../../common/utils/sendUtil');
const errUtil = require('../../common/utils/errUtil');
const jwtUtil = require('../../common/utils/jwtUtil');

const errCode = require('../../common/define/errCode');
const jwt = require("jsonwebtoken");

let file_name = fileUtil.name(__filename);

module.exports = function (req, res, next) {
    const _funcName = arguments.callee.name;

    try {
        req.file_name = file_name;

        checkParam(req);

        mysqlUtil.connectPool(async function (db_connection) {
            req.innerBody = {};

            req.innerBody['item'] = await queryCheck(req, db_connection);
            if(!req.innerBody['item']) {
                errUtil.createCall(errCode.invalid_access_token, `Error code: 702 [해당 유저의 접속 토큰이 유효하지 않습니다. 다시 로그인 해주세요.]`);
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

    if(!paramUtil.checkParam_return(req.headers, 'access_token')) {
        errUtil.createCall(errCode.invalid_access_token, `Error code: 308 [접속 토큰이 존재하지 않습니다. 다시 로그인 해주세요.]`);
    }

    let token = req.headers['access_token'];
    // jwt 인증
    try {
        let data = jwtUtil.getPayload(token);
        console.log("ASDADSDA: " + JSON.stringify(data));
        req.headers['user_uid'] = data['uid'];
    }
    // 세션이 만료되거나 인증이 되지 않으면 에러를 발생시켜서 에러를 catch
    catch (ex) {
        errUtil.createCall(errCode.invalid_access_token, `Error code: 702 [해당 유저의 접속 토큰이 유효하지 않습니다. 다시 로그인 해주세요.]`);
    }
}

function queryCheck(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_user_access_token_check'
        , [
            req.headers['user_uid']
          , req.headers['access_token']
        ]
    )
}
