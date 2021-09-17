/**
 * Created by gunucklee on 2021. 09. 09.
 */
const express = require('express');
const app = express();


/**
 * User
 */
app.route('/user').put( require('./user/updateUser') )
                        .delete( require('./user/deleteUser') );

app.route('/user/me').get( require('./user/selectUserMe') );
app.route('/user/other').get( require('./user/selectUserOther') );


/**
 * Alert
 */
app.route('/alert')




module.exports = app;