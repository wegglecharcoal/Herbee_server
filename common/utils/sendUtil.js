/**
 * Created by gunucklee on 2021. 09. 09
 */
const errCode = require('../define/errCode');

const moment = require('moment');

module.exports = {

    sendSuccessPacket: function (req, res, jsonData, show_log = false) {

        let os = !req.headers["os"] ? '' : req.headers["os"].toUpperCase();

        jsonData['method'] = req.method;
        jsonData['url'] = req.originalUrl;

        res.send(jsonData);

        let log_tag = `${moment()}, url(${req.originalUrl}), Method(${req.method})`;
        console.log(`[${log_tag}] Send sendSuccessPacket start ======================`);
        if( show_log ) {
            console.log(`[${log_tag}] Send sendSuccessPacket jsonData: ${JSON.stringify(jsonData)}`);
        }
        else {
            console.log(`[${log_tag}] Send sendSuccessPacket jsonData: hide log`);
        }

    },

    sendErrorPacket: function (req, res, err) {
        let jsonData = {};

        jsonData['code'] = !(err instanceof Error) ? errCode.system : err.code;
        jsonData['message'] = !(err instanceof Error) ? err.stack : err.message;
        jsonData['method'] = req.method;
        jsonData['url'] = req.originalUrl;

        res.status(400);
        res.send(jsonData);

        if( !req.file_name) {
            req.file_name = '';
        }

        let log_tag = `${moment()},file(${req.file_name}),url(${req.originalUrl}),Method(${req.method})`;
        if( jsonData['code'] === errCode.system ) {
            console.error(`[${log_tag}] Error sendErrorPacket start ================================`);
            console.error(`[${log_tag}] Error sendErrorPacket jsonData: ${JSON.stringify(jsonData)}`);
        }
    },
}