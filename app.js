const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const funcUtil = require('./common/utils/funcUtil');
const sendUtil = require('./common/utils/sendUtil');
const errUtil = require('./common/utils/errUtil');
const errCode = require('./common/define/errCode');

require('dotenv').config();

const indexRouter = require('./routes/index');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('views engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECURE_KEY))
app.use(express.static(path.join(__dirname, 'public')));

if( !funcUtil.isRealServer ) {
    app.use('/api-docs', require('./apiDocs/swaggerDocs'))
}

app.all('/api/public/*', require('./routes/middleware/setHeader'));
app.all('/api/private/*', require('./routes/middleware/setHeader'));

app.all('/api/private/*', require('./routes/middleware/checkAccessToken'));

app.use('/api/private', require('./routes/api/api_private'));
app.use('/api/public', require('./routes/api/api_public'));
app.use('/others', require('./routes/page/page_router'));


app.use('/', indexRouter);

// If you use Cron use this codes
// const cron = require('./routes/cron/')
// cron.start();

app.use(function(req,res,next) {
    console.log(`===== req.baseUrl: ${req.baseUrl}`);
    console.log(`===== req.originalUrl: ${req.originalUrl}`);
    console.log(`===== req.originalUrl.indexOf: ${req.originalUrl.indexOf('/api')}`);

    if( req.originalUrl.indexOf('/api') === 0) {
        sendUtil.sendErrorPacket(req, res, errUtil.initError(errCode.path, `존재 하지 않는 url 경로 입니다. 요청 url: ${req.originalUrl}`));
    }
    else {
        next();
    }
});

// catch 404 and forward to error handler
app.use(function(req,res, next) {
    next(createError(404));
});

// err handler
app.use(function(err,req,res) {

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ?  err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;












