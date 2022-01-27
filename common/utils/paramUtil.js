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
            // 한글 버전
            // errUtil.createCall(errCode.param, `파라미터 오류 발생. 파라미터를 확인해 주세요.\n확인 파라미터 : ${key}`);
            // 영어 버전
            errUtil.createCall(errCode.param, `Parameter error occurred. Please check the parameters.\nConfirmation: ${key}`);
        }
        else if (param[key].length <= minLength) {
            // 한글 버전
            // errUtil.createCall(errCode.param, `파라미터 오류 발생. ${minLength}자 이상 입력해 주세요.\n확인 파라미터 : ${key}`);
            // 영어 버전
            errUtil.createCall(errCode.param, `Parameter error occurred. Please enter more than ${minLength} characters.\\n Verification parameter: ${key}`);
        }
        else if (param[key].length > maxLength) {
            // 한글 버전
            // errUtil.createCall(errCode.param, `파라미터 오류 발생. ${maxLength}자 이상 입력 하실 수 없습니다.\n확인 파라미터 : ${key}`);
            // 영어 버전
            errUtil.createCall(errCode.param, `Parameter error occurred. You cannot enter more than ${maxLength} characters.\n Verification parameter: ${key}`);
        }
    },


    checkHeader_noReturn: function (param, key, minLength = 0, maxLength = 20000) {
        if (!param[key]) {
            // 한글 버전
            // errUtil.createCall(errCode.param, `헤더 파라미터 오류 발생. 헤더 파라미터를 확인해 주세요.\n확인 헤더 파라미터 : ${key}`);
            // 영어 버전
            errUtil.createCall(errCode.param, `Header parameter error. Please check the header parameter.\nConfirm header parameter: ${key}`);
        }
        else if (param[key].length <= minLength) {
            // 한글 버전
            // errUtil.createCall(errCode.param, `헤더 파라미터 오류 발생. ${minLength}자 이상 입력해 주세요.\n확인 헤더 파라미터 : ${key}`);
            // 영어 버전
            errUtil.createCall(errCode.param, `Header parameter error occurred. Please enter more than ${minLength} characters.\nConfirm header parameter: ${key}`);
        }
        else if (param[key].length > maxLength) {
            // 한글 버전
            // errUtil.createCall(errCode.param, `헤더 파라미터 오류 발생. ${maxLength}자 이상 입력 하실 수 없습니다.\n확인 헤더 파라미터 : ${key}`);
            // 영어 버전
            errUtil.createCall(errCode.param, `Header parameter error occurred. You cannot enter more than ${maxLength} characters.\nConfirm header parameter: ${key}`);
        }
    },

    checkParam_alreadyUse: function (item, errMsg) {
        if(item) {
            errUtil.createCall(errCode.already, errMsg);
        }
    }


}