/**
 * Created by gunucklee on 2021. 09. 10.
 */
const moment = require('moment');

module.exports = {
    printUrlLog: function (req, msg) {
        if (!req) {
            return;
        }
        if (!req.file_name) {
            req.file_name = '';
        }
        let log_tag = `file(${req.file_name}),url(${req.originalUrl}),Method(${req.method})`;
        console.log(`[${moment()},${log_tag}] ${msg}`);
    }
}