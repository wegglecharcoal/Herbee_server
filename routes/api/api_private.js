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
 * Comment
 */
app.route('/comment').post( require('./comment/createComment'))
                           .delete( require('./comment/deleteComment') );

app.route('/comment/list').get( require('./comment/selectCommentList'));



app.route('/comment/nested').post( require('./comment/createCommentNested'))
                                  .delete( require('./comment/deleteCommentNested') );


app.route('/comment/nested/list').get( require('./comment/selectCommentNestedList'));



/**
 * Follow
 */
app.route('/follow').post( require('./follow/createFollow') )
                          .delete( require('./follow/deleteFollow') );


app.route('/follow/list').get( require('./follow/selectFollowList') );


/**
 * Report
 */
app.route('/report').post( require('./report/createReport') );


/**
 * Alert
 */
app.route('/alert')




module.exports = app;