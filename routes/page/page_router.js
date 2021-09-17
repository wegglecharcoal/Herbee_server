/**
 * Created by gunucklee on 2021. 06. 03.
 */
const express = require('express');
const app = express();

/**
 * daum api
 */
app.route('/postcode').get( require('../page/postcode/selectPostcode') );

module.exports = app;
