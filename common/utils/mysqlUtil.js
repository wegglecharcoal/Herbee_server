/**
 * Created by gunucklee on 2021. 09. 10.
 */
const mysql = require('mysql');
const moment = require('moment');

const funcUtil = require('./funcUtil');
const errUtil = require('./errUtil');

const errCode = require('../define/errCode');

let mysqlConfig = {
    host: funcUtil.getDBHost(),
    port: "3306",
    user: funcUtil.getDBUser(),
    password: funcUtil.getDBPassword(),
    database: funcUtil.getDBSchema(),
    timezone: "utc",
    charset: "utf8mb4",

    connectTimeout: 5000,
    connectionLimit: 1000,
    waitForConnection: true,
    multipleStatements: true,
}

const pool = mysql.createPool(mysqlConfig);

console.log(`====> funcUtil.getDBHost(): ${funcUtil.getDBHost()}`);

let self;
self = module.exports = {

    connectPool: function (asyncFunc, errorHandler) {
        pool.getConnection (async function (err, connection) {
            try {
                console.log(`[${moment()}] Error connectPool start ======================`);
                if (err) {
                    await errorHandler(errUtil.initError(errCode.system, err.message, err.stack));
                } else {
                    await connection.beginTransaction();
                    await asyncFunc(connection);
                    await connection.commit();
                }
            } catch (e) {
                connection.rollback();

                console.log(`[${moment()}] Error connectPool start ======================`);
                console.log(`[${moment()}] Error connectPool instanceof Error: ${(e instanceof Error)}`);
                console.log(`[${moment()}] Error connectPool e: ${e}`);
                console.log(`[${moment()}] Error connectPool e.message: ${e.message}`);
                let _stack = (e instanceof Error) ? '' : (e.stack ? e.stack : e);
                let _msg = (e instanceof Error) ? e.message : e;
                let _code = (e instanceof Error) ? e.code : errCode.system;

                let _err = (e instanceof Error) ? e : errUtil.initError(_code, _msg, _stack);

                if (e.stack) {
                    console.log(`[${moment()}] Error connectPool stack: ${e.stack}`);
                }


                console.log(`[${moment()}] Error connectPool _err: ${JSON.stringify(_err)}`);
                console.log(`[${moment()}] Error connectPool end ======================`);
                await errorHandler(_err);
            } finally {
                if( connection && connection.state !== 'disconnected') {
                    console.log(`=======>>>>> connection release`);
                    connection.release();
                }
            }
        });
    },

    query: async function (db_connection, query, params, resultCallback) {
        let query_fun = query+initParameter(params);
        console.log(`!$@params: ${params}`);
        console.log(`=======>>> query query_fun: ${query_fun}`);

        if (db_connection && db_connection.state !== 'disconnected') {
            await db_connection.query(
                query_fun,
                params,
                async function (err, rows, fields) {
                    if (err) {
                        await resultCallback(null, errUtil.initError(errCode.system, err.message, err.stack));
                    }
                    else {
                        await resultCallback(rows, null);
                    }
                });
        }
        else {
            await resultCallback(null, errUtil.initError(errCode.system, 'queryInfo is error - msg', 'queryInfo is error - stack'));
        }
    },

    querySingle: function (db_connection, query, params) {
        const _funcName = arguments.callee.name;

        return new Promise(function (resolve, reject) {
            self.query (db_connection, query, params, function (rows, err) {

                if (err) {
                    reject(err);
                }
                else {
                    if (Array.isArray(rows)) {
                        resolve(rows[0][0]);
                    } else {
                        resolve(null);
                    }
                }

            });
        });
    },

    queryArray: function (db_connection, query, params) {
        const _funcName = arguments.callee.name;

        return new Promise(function (resolve, reject) {
            self.query(db_connection, query, params, function (rows, err) {

                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows[0]);
                }

            });
        });
    },

}

function initParameter(params) {
    let func_param = '(';
    params.map(
        function (param, idx) {
            func_param = func_param + (idx === 0 ? '?' : ',?')
        }
    );
    func_param = func_param + ')';
    return func_param;
}