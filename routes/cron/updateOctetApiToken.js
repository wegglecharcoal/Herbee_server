const paramUtil = require('../../common/utils/paramUtil');
const fileUtil = require('../../common/utils/fileUtil');
const mysqlUtil = require('../../common/utils/mysqlUtil');
const sendUtil = require('../../common/utils/sendUtil');
const errUtil = require('../../common/utils/errUtil');
const logUtil = require('../../common/utils/logUtil');
const jwtUtil = require('../../common/utils/jwtUtil');
const funcUtil = require('../../common/utils/funcUtil');
const octetUtil = require('../../common/utils/octetUtil');

const errCode = require('../../common/define/errCode');
const schedule = require('node-schedule');

let file_name = fileUtil.name(__filename);
module.exports ={
    start: function(){
        try{
            //매일 새벽 01:00 에 진행
            // const job = schedule.scheduleJob('0 0 1 * * *', function (){
            const job = schedule.scheduleJob('*/10 * * * * *', function (){
                console.log('스케쥴 시작')
                mysqlUtil.connectPool(async function (db_connection) {
                    let current_access_token = await querySelectOctetAccessToken(db_connection);
                    console.log('1.current_access_token',current_access_token)

                    let get_token_result = await octetUtil.octetToken(current_access_token['access_token']);
                    console.log('2.get_token_result:[maintain or token]', get_token_result)

                    if(get_token_result !== 'maintain'
                        && get_token_result !== null && get_token_result !== undefined ) {
                        let change_access_token = await queryUpdateOctetAccessToken(get_token_result, db_connection);
                        console.log('3.change_access_token',change_access_token)
                        return
                    }
                    console.log('토큰 갱신 안함. 유효기간 남음')
                }, function (err) {
                    console.log(err)
                });
            });
        }
        catch (e) {
            console.log(e)
        }
    }
}

function querySelectOctetAccessToken(db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_select_octet_access_token'
        , []
    );
}

function queryUpdateOctetAccessToken(accessToken, db_connection) {
    const _funcName = arguments.callee.name;

    return mysqlUtil.querySingle(db_connection
        , 'call proc_update_octet_access_token'
        , [
            accessToken['access_token']
        ]
    );
}
