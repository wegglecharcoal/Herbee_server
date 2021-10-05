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
 * Feed
 */
app.route('/feed/list')
    .get( require('./feed/selectFeedList') );

app.route('/feed/me/list')
    .get( require('./feed/selectFeedMeList') );

app.route('/feed/me/like/list')
    .get( require('./feed/selectFeedMeLikeList') );

app.route('/feed/other/list')
    .get( require('./feed/selectFeedOtherList') );

/**
 * BalanceGame
 */
app.route('/balanceGame/question/daily')
    .get( require('./balanceGame/selectBalanceGameQuestionDaily') );

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
 * ChatRoom
 */
app.route('/chatRoom/general')
    .post( require('./chatRoom/createChatRoomGeneral') );

app.route('/chatRoom/gathering')
    .post( require('./chatRoom/createChatRoomGathering') );

app.route('/chatRoom/enter')
    .post( require('./chatRoom/createChatRoomEnter') );

app.route('/chatRoom')
    .delete( require('./chatRoom/deleteChatRoom') );

app.route('/chatRoom/exit')
    .delete( require('./chatRoom/deleteChatRoomExit') );

app.route('/chatRoom/kick')
    .delete( require('./chatRoom/deleteChatRoomKick') );

app.route('/chatRoom/list')
    .get( require('./chatRoom/selectChatRoomList') )

app.route('/chatRoom/user/list')
    .get( require('./chatRoom/selectChatRoomUserList') )

/**
 * Promise
 */
app.route( '/promise' )
    .post( require('./promise/createPromise') );

// app.route( '/promise' )
//     .post( require('./promise/createPromise') );

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
app.route('/like')
    .put( require('./like/updateLike') );


/**
 * Report
 */
app.route('/report')
    .post( require('./report/createReport') );

/**
 * Block
 */
app.route('/block/user')
    .delete( require('./block/deleteBlockUser'))

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