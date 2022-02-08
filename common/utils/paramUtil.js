/**
 * Created by gunucklee on 2021. 09. 10.
 */
const errUtil = require('./errUtil');
const errCode = require('../define/errCode');

module.exports = {
    parse: function (req) {
        switch (req.method) {
            case 'GET':
            case 'DELETE':
                return req.query;
            case 'PUT':
            case 'POST':
                return req.body;
        }
    },

    checkParam_return: function (param, key, minLength = 0, maxLength = 20000) {
        if (!param[key]) {
            return false;
        }
        else if (param[key].length <= minLength) {
            return false;
        }
        else if (param[key].length > maxLength) {
            return false;
        }

        return true;
    },

    checkParam_noReturn: function (param, key, minLength = 0, maxLength = 20000) {
        if (!param[key] && param[key] !== 0) {
            errUtil.createCall(errCode.param, `Error code: 301 [파라미터 오류 발생. 파라미터를 확인해 주세요.\n확인 파라미터 : ${key}]`);
        }
        else if (param[key].length <= minLength) {
            errUtil.createCall(errCode.param, `Error code: 401 [파라미터 오류 발생. ${minLength}자 이상 입력해 주세요.\n확인 파라미터 : ${key}]`);
        }
        else if (param[key].length > maxLength) {
            errUtil.createCall(errCode.param, `Error code: 102 [파라미터 오류 발생. ${maxLength}자 이상 입력 하실 수 없습니다.\n확인 파라미터 : ${key}]`);
        }
    },


    checkHeader_noReturn: function (param, key, minLength = 0, maxLength = 20000) {
        if (!param[key]) {
            errUtil.createCall(errCode.param, `Error code: 302 [헤더 파라미터 오류 발생. 헤더 파라미터를 확인해 주세요.\n확인 헤더 파라미터 : ${key}]`);
        }
        else if (param[key].length <= minLength) {
            errUtil.createCall(errCode.param, `Error code: 402 [헤더 파라미터 오류 발생. ${minLength}자 이상 입력해 주세요.\n확인 헤더 파라미터 : ${key}]`);
        }
        else if (param[key].length > maxLength) {
            errUtil.createCall(errCode.param, `Error code: 103 [헤더 파라미터 오류 발생. ${maxLength}자 이상 입력 하실 수 없습니다.\n확인 헤더 파라미터 : ${key}]`);
        }
    },

    checkParam_alreadyUse: function (item, errCode, errMsg) {
        if(item) {
            errUtil.createCall(errCode, errMsg);
        }
    }


}