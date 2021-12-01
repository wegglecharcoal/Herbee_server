/**
 * Created by gunucklee on 2021. 12. 01.
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
        console.log('adasdajsdako: ' + JSON.stringify(req.query));
        req.paramBody = paramUtil.parse(req);
        console.log('옥텟 히스토리 생성 creakcejowe');
        mysqlUtil.connectPool( async function (db_connection) {
            req.innerBody = {};

            console.log('adasdaqwdqwdjsdako: ' + JSON.stringify(req.paramBody));;

            console.log('req.okfewo: ' + req.paramBody['data']['id'] );
            console.log('req.okfewo: ' + req.paramBody['data']['coinSymbol'] );
            console.log('req.okfewo: ' + req.paramBody['data']['idx'] );

            // req.innerBody['item'] = await queryCreate(req, db_connection);

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
}

function deleteBody(req) {
}

function queryCreate(req, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_create_octet_history'
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


