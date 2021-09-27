/**
 * Created by gunucklee on 2021. 09. 09.
 */
const express = require('express');
const app = express();


/**
 * User
 */
app.route('/user')
    .put( require('./user/updateUser') )
    .delete( require('./user/deleteUser') );

app.route('/user/me')
    .get( require('./user/selectUserMe') );

app.route('/user/other')
    .get( require('./user/selectUserOther') );


/**
 * Lifestyle
 */
app.route('/lifestyle')
    .post( require('./lifestyle/createLifestyle') )
    .put( require('./lifestyle/updateLifestyle') )
    .delete( require('./lifestyle/deleteLifestyle') );


/**
 * LocalReview
 */
app.route('/localReview')
    .post( require('./localReview/createLocalReview') )
    .put( require('./localReview/updateLocalReview') )
    .delete( require('./localReview/deleteLocalReview') );
//                                .delete( require('./localReview/deleteLocalReview') )
//
// app.route('/localReview/list').get( require('./localReview/selectLocalReviewList') )


/**
 * Address
 */
app.route('/addressBook')
    .put( require('./address/updateAddressBook') )
    .get( require('./address/selectAddressBook') );

app.route('/addressBook/default')
    .put( require('./address/updateAddressBookDefault') );

/**
 * Comment
 */
app.route('/comment')
    .post( require('./comment/createComment'))
    .delete( require('./comment/deleteComment') );

app.route('/comment/list')
    .get( require('./comment/selectCommentList'));



app.route('/comment/nested')
    .post( require('./comment/createCommentNested'))
    .delete( require('./comment/deleteCommentNested') );


app.route('/comment/nested/list')
    .get( require('./comment/selectCommentNestedList'));



/**
 * Follow
 */
app.route('/follow')
    .post( require('./follow/createFollow') )
    .delete( require('./follow/deleteFollow') );


app.route('/follow/list')
    .get( require('./follow/selectFollowList') );


/**
 * Report
 */
app.route('/report')
    .post( require('./report/createReport') );

/**
 * Block
 */
app.route('/block/user/list')
    .get( require('./block/selectBlockUserList'))


/**
 * Alert
 */
app.route('/alert/history')
    .delete( require('./alert/deleteAlertHistory') );

app.route('/alert/history/list')
    .get( require('./alert/selectAlertHistoryList') );

app.route('/alert/comment')
    .put( require('./alert/updateAlertComment') );

app.route('/alert/msg')
    .put( require('./alert/updateAlertMsg') );

app.route('/alert/follower')
    .put( require('./alert/updateAlertFollower') );

app.route('/alert/like')
    .put( require('./alert/updateAlertLike') );

app.route('/alert/dailyQuestion')
    .put( require('./alert/updateAlertDailyQuestion') );

app.route('/alert/marketing')
    .put( require('./alert/updateAlertMarketing') );

app.route('/alert/promise')
    .put( require('./alert/updateAlertPromise') );

/**
 * Honey
 */
app.route( '/honeyHistory')
    .post( require('./honey/createHoneyHistory') );

app.route( '/honeyHistory/list')
    .get( require('./honey/selectHoneyHistoryList') );

app.route( '/honeyPrice/list')
    .get( require('./honey/selectHoneyPriceList') );

app.route( '/honeyManual/list')
    .get( require('./honey/selectHoneyManualList') );


/**
 * Notice
 */
app.route('/notice/list')
    .get( require('./notice/selectNoticeList') );



module.exports = app;