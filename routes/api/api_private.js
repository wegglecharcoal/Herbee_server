/**
 * Created by gunucklee on 2021. 09. 09.
 */
const express = require('express');
const app = express();


const checkHoneyAvailable = require('../middleware/checkHoneyAvailable');
/**
 * User
 */
app.route('/user/recommender/code')
    .post( require('./user/createUserRecommenderCode') );

app.route('/user')
    .put( require('./user/updateUser') )
    .delete( require('./user/deleteUser') );

app.route('/user/me')
    .get( require('./user/selectUserMe') );

app.route('/user/other')
    .get( require('./user/selectUserOther') );

app.route('/user/overtime/check')
    .get( require('./user/selectUserOvertimeCheck') );

/**
 * Feed
 */
app.route('/feed/count/view')
    .put( require('./feed/updateFeedCountView') );

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
app.route('/balanceGame/search/topic/list')
    .get( require('./balanceGame/selectBalanceGameSearchTopicList') );

app.route('/balanceGame/question/daily')
    .get( require('./balanceGame/selectBalanceGameQuestionDaily') );

app.route('/balanceGame/vote/result')
    .get( require('./balanceGame/selectBalanceGameVoteResult') );

app.route('/balanceGame/answer/list')
    .get( require('./balanceGame/selectBalanceGameAnswerList') );


/**
 * Lifestyle
 */
app.route('/lifestyle')
    .post( require('./lifestyle/createLifestyle') )
    .put( require('./lifestyle/updateLifestyle') )
    .delete( require('./lifestyle/deleteLifestyle') );

app.route('/lifestyle/same/topic/list')
    .get( require('./lifestyle/selectLifestyleSameTopicList') );

app.route('/lifestyle/popular/topic/list')
    .get( require('./lifestyle/selectLifestylePopularTopicList') );


// 추후 업데이트되면 지워야할 Path API
app.route('/lifestyle/realTime/list')
    .get( require('./lifestyle/selectLifestyleRecentList') );

app.route('/lifestyle/recent/list')
    .get( require('./lifestyle/selectLifestyleRecentList') );

/**
 * LocalReview
 */
app.route('/localReview')
    .post( require('./localReview/createLocalReview') )
    .put( require('./localReview/updateLocalReview') )
    .delete( require('./localReview/deleteLocalReview') );

app.route('/localReview/list')
    .get( require('./localReview/selectLocalReviewList') );

app.route('/localReview/building/list')
    .get( require('./localReview/selectLocalReviewBuildingList') );

app.route('/localReview/image/list')
    .get( require('./localReview/selectLocalReviewImageList') );

app.route('/localReview/recent/visit/list')
    .get( require('./localReview/selectLocalReviewRecentVisitList') );


//                                .delete( require('./localReview/deleteLocalReview') )
//
// app.route('/localReview/list').get( require('./localReview/selectLocalReviewList') )

/**
 * ChatRoom
 */
app.route('/chatRoom/general')
    .post( checkHoneyAvailable, require('./chatRoom/createChatRoomGeneral') );

app.route('/chatRoom/gathering')
    .post( checkHoneyAvailable, require('./chatRoom/createChatRoomGathering') );

app.route('/chatRoom/enter')
    .post( checkHoneyAvailable, require('./chatRoom/createChatRoomEnter') );

app.route('/chatRoom/retry')
    .put( checkHoneyAvailable, require('./chatRoom/updateChatRoomRetry') );

app.route('/chatRoom/status')
    .put( require('./chatRoom/updateChatRoomStatus') );

app.route('/chatRoom/recentMsg')
    .put( require('./chatRoom/updateChatRoomRecentMsg') );

app.route('/chatRoom/user/chatReadTime')
    .put( require('./chatRoom/updateChatRoomUserChatReadTime') );

app.route('/chatRoom/head')
    .put( require('./chatRoom/updateChatRoomHead') );

app.route('/chatRoom')
    .delete( require('./chatRoom/deleteChatRoom') );

app.route('/chatRoom/exit')
    .delete( require('./chatRoom/deleteChatRoomExit') );

app.route('/chatRoom/kick')
    .delete( require('./chatRoom/deleteChatRoomKick') );

app.route('/chatRoom/retry')
    .delete( require('./chatRoom/deleteChatRoomRetry') );

app.route('/chatRoom/list')
    .get( require('./chatRoom/selectChatRoomList') );

app.route('/chatRoom/user/list')
    .get( require('./chatRoom/selectChatRoomUserList') );


app.route('/chatRoom/exit/reason')
    .get( require('./chatRoom/selectChatRoomExitReason') );

app.route('/chatRoom/gathering/list')
    .get( require('./chatRoom/selectChatRoomGatheringList') );

/**
 * Promise
 */
app.route( '/promise' )
    .post(checkHoneyAvailable, require('./promise/createPromise') )
    .put( require('./promise/updatePromise') )
    .delete( require('./promise/deletePromise') );

app.route( '/promise/user' )
    .put( require('./promise/updatePromiseUser') );

app.route( '/promise/my/position' )
    .put( require('./promise/updatePromiseMyPosition') );

app.route( '/promise/after/recommend/list' )
    .get( require('./promise/selectPromiseAfterRecommendList') );

app.route('/promise/enter')
    .post( require('./promise/createPromiseEnter') );

app.route( '/promise/me/list' )
    .get( require('./promise/selectPromiseMeList') );

app.route( '/promise/chatRoom/list' )
    .get( require('./promise/selectPromiseChatRoomList') );



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
app.route('/block/phone')
    .post( require('./block/createBlockPhone') );

app.route('/block/user')
    .post( require('./block/createBlockUser') );

app.route('/block/contents')
    .post( require('./block/createBlockContents') );

app.route('/block/user')
    .delete( require('./block/deleteBlockUser') );

app.route('/block/user/list')
    .get( require('./block/selectBlockUserList') );

app.route('/block/phone/list')
    .get( require('./block/selectBlockPhoneList') );

/**
 * Alert
 */
app.route('/alert/send/msg')
    .post( require('./alert/createAlertSendMsg') );

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

app.route('/honey/subscribe')
    .put( require('./honey/updateHoneySubscribe') );

app.route( '/honeyHistory/list')
    .get( require('./honey/selectHoneyHistoryList') );

app.route( '/honeyPrice/list')
    .get( require('./honey/selectHoneyPriceList') );

app.route( '/honeyManual')
    .get( require('./honey/selectHoneyManual') );

app.route( '/honeyManual/list')
    .get( require('./honey/selectHoneyManualList') );


/**
 * Notice
 */
app.route('/notice/list')
    .get( require('./notice/selectNoticeList') );

/**
 * Octet
 */
app.route('/octet/withdraw')
    .post( require('./octet/createOctetWithdraw') );
app.route('/octet/exchange')
    .post( require('./octet/createOctetExchange') );
app.route('/octet/history/list')
    .get( require('./octet/selectOctetHistoryList') );
app.route('/octet/bee/coin')
    .get( require('./octet/selectOctetBeeCoin') );
app.route('/octet/walletAddress')
    .get( require('./octet/selectOctetWalletAddress') );
app.route('/octet/exchange/rate')
    .get( require('./octet/selectOctetExchangeRate') );
app.route('/octet/fee')
    .get( require('./octet/selectOctetFee') );
app.route('/octet/is/withdraw')
    .get( require('./octet/selectOctetIsWithdraw') );
app.route('/octet/wallet/address/validation')
    .get( require('./octet/selectOctetWalletAddressValidation') );

module.exports = app;