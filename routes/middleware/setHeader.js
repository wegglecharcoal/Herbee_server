/**
 * Created by gunucklee on 2021. 09. 14.
 */

const paramUtil = require('../../common/utils/paramUtil');
const fileUtil = require('../../common/utils/fileUtil');
const errUtil = require('../../common/utils/errUtil');
const sendUtil = require('../../common/utils/sendUtil');
const jwtUtil = require('../../common/utils/jwtUtil');

let file_name = fileUtil.name(__filename);

module.exports = function (req, res, next) {
    const _funcName = arguments.callee.name;

    try {
        req.file_name = file_name;

        req.headers['user_uid'] = 0;

        if(paramUtil.checkParam_return(req.headers, 'access_token')) {
            let token = req.headers['access_token'];
            let data = jwtUtil.getPayload(token);
            req.headers['user_uid'] = data['uid'];
        }
    }
    catch (e) {
        // let _err = errUtil.get(e);
        // sendUtil.sendErrorPacket(req, res, _err);
    }
    finally {
        next();
    }
}
