/**
 * Created by gunucklee on 2021. 09. 09.
 */
const express = require('express');
const app = express();


/**
 * user api
 */
app.route('/user/signup')
    .post( require('./user/createUser') );

app.route('/user/signup/check')
    .get( require('./user/selectUserSignUpCheck') );

app.route('/user/email/check')
    .get( require('./user/selectUserEmailCheck') );

app.route('/user/nickname/check')
    .get( require('./user/selectUserNicknameCheck') );

/**
 * address
 */

app.route('/address/info/search')
    .get( require('./address/selectAddressInfoSearch') );

/**
 * octet
 */
app.route('/octet/history')
    .post( require('./octet/createOctetHistory'));


/**
 * file api
 */
app.route('/file')
    .post( require('../../common/utils/awsS3Util').uploadFile, require('./file/uploadFile'))


/**
 * dev api
 */
app.route('/dev/test')
    .get( require('./_dev/_dev_select') )



module.exports = app;