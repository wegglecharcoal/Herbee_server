/**
 * Created by gunucklee on 2021. 08. 22.
 */

const funcUtil = require('./funcUtil')

const axios = require('axios');
const {log} = require("debug");

axios.defaults.headers.common['Authorization'] = `key=${funcUtil.getFCMKey()}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// fcm_type
// 0: 메시지 알림
// 1: 팔로우 알림
// 2: 좋아요 알림
// 3: 댓글 알림
// 4: 약속 알림


module.exports = {

    fcmMsgArray : async function(item){
        return await fcmFunc(
              item['fcm_push_token_other_list']

            // 한글 버전
            // , "메시지 알림"
            // 영어 버전
            , "message notification"

            // 한글 버전
            // , `${item['fcm_nickname_me']}님이 메시지를 보냈습니다.`
            // 영어 버전
            , `${item['fcm_nickname_me']} sent me a message.`

            // 한글 버전
            // , "메시지"
            // 영어 버전
            , "message"

            , "0"
            , item['fcm_filename_me']
            , item['fcm_target_uid']
            , null
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmFollowSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token_other']]

            // 한글 버전
            // , "팔로우 알림"
            // 영어 버전
            , "follow notification"

            // 한글 버전
            // , `${item['fcm_nickname_me']}님이 당신을 팔로우 했습니다.`
            // 영어 버전
            , `${item['fcm_nickname_me']} followed you.`

            // 한글 버전
            , "팔로우"
            // 영어 버전
            , "follow"

            , "1"
            , item['fcm_filename_me']
            , item['fcm_target_uid']
            , null
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmLikePostSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token_other']]

            // 한글 버전
            // , "게시물 좋아요 알림"
            // 영어 버전
            , "clicked like on the post notification"

            // 한글 버전
            // , `${item['fcm_nickname_me']}님이 게시물에 좋아요를 눌렀습니다.`
            // 영어 버전
            , `${item['fcm_nickname_me']} clicked like on the post.`

            // 한글 버전
            // , "좋아요"
            // 영어 버전
            , "like"

            , "2"
            , item['fcm_filename_me']
            , item['fcm_target_uid']
            , item['fcm_type']
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmLikeCommentSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token_other']]

            // 한글 버전
            // , "댓글 좋아요 알림"
            // 영어 버전
            , "pressed comment like notification"

            // 한글 버전
            // , `${item['fcm_nickname_me']}님이 댓글에 좋아요를 눌렀습니다.`
            // 영어 버전
            , `${item['fcm_nickname_me']} pressed like in the comments.`

            // 한글 버전
            // , "좋아요"
            // 영어 버전
            , "like"

            , "2"
            , item['fcm_filename_me']
            , item['fcm_target_uid']
            , item['fcm_type']
        );
    },
    fcmCommentSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token_other']]

            // 한글 버전
            // , "댓글 알림"
            // 영어 버전
            , "left a comment comment notification"

            // 한글 버전
            // , `${item['fcm_nickname_me']}님이 게시물에 댓글을 남겼습니다.`
            // 영어 버전
            , `${item['fcm_nickname_me']} left a comment on the post.`

            , "댓글"
            , "3"
            , item['fcm_filename_me']
            , item['fcm_target_uid']
            , item['fcm_type']
        );
    },
    fcmPromiseCreateArray : async function(item){
        return await fcmFunc(
            item['fcm_push_token_other_list']

            // 한글 버전
            // , "약속 생성 알림"
            // 영어 버전
            , "made an promise notification"

            // 한글 버전
            // , `${item['fcm_nickname_me']}님이 약속을 잡았습니다.`
            // 영어 버전
            , `${item['fcm_nickname_me']} made an promise.`

            , "약속"
            , "4"
            , item['fcm_filename_me']
            , item['fcm_target_uid']
            , null
        );
    },
    fcmPromiseAcceptSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token_other']]

            // 한글 버전
            // , "약속 수락 알림"
            // 영어 버전
            , "accepted the promise notification"

            // 한글 버전
            // , `${item['fcm_nickname_me']}님이 약속을 수락했습니다.`
            // 영어 버전
            , `${item['fcm_nickname_me']} accepted the promise.`

            , "약속"
            , "4"
            , item['fcm_filename_me']
            , item['fcm_target_uid']
            , null
        );
    },
    fcmPromiseAfterAnHourSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token_me']]
            // 한글 버전
            // , "약속 한 시간 전 알림"
            // 영어 버전
            , "an hour before the promise notification"

            // 한글 버전
            // , `${item['fcm_nickname_other']}님과의 약속 잊지 않으셨죠? 출발할 때 알려주세요.`
            // 영어 버전
            , `You didn't forget your promise with ${item['fcm_nickname_other']}, right? Please let me know when you leave.`

            , "약속"
            , "4"
            , item['fcm_filename_other']
            , item['fcm_target_uid']
            , null
        );
    },
    fcmPromiseDepartSingle : async function(item){
        return await fcmFunc(
            [item['fcm_push_token_other']]

            // 한글 버전
            // , "약속 출발 알림"
            // 영어 버전
            , "Promise start notification"

            // 한글 버전
            // , `${item['fcm_nickname_me']}님이 약속 장소로 향하고 있습니다.`
            // 영어 버전
            , `${item['fcm_nickname_me']} is heading to the meeting place.`

            // 한글 버전
            // , "약속"
            // 영어 버전
            , "promise"

            , "4"
            , item['fcm_filename_me']
            , item['fcm_target_uid']
            , null
        );
    },
    fcmPromiseRetentionSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token_me']]

            // 한글 버전
            // , "약속 리텐션"
            // 영어 버전
            , "promise retention notification"

            // 한글 버전
            // , `${item['fcm_nickname_other']}님과의 약속 어떠셨나요?`
            // 영어 버전
            , `How was the meeting with ${item['fcm_nickname_other']}?`

            // 한글 버전
            // , "약속"
            // 영어 버전
            , "promise"

            , "4"
            , item['fcm_filename_other']
            , item['fcm_target_uid']
            , null
        );
    },
};



async function fcmFunc(token, title, message, channel, fcm_type, filename, target_uid, type){
    return  await axios.post('https://fcm.googleapis.com/fcm/send', {
        "registration_ids": token,
        "priority": "high",
        "data": {
            "title": title,
            "message": message,
            "channel" : channel,
            "fcm_type" : fcm_type,
            "filename" : filename,
            "target_uid" : target_uid,
            "type" : type
        },
        "notification": {
            "icon" : 'ic_icon',
            "title": title,
            "body": message,
            "channel" : channel,
            "fcm_type" : fcm_type,
            "filename" : filename,
            "target_uid" : target_uid,
            "type" : type,
            "sound" : "default",
            "badge": "1",
            "content-available" : "true",
            "apns-priority" : "5",
            "badge count" : "0",
            "android_channel_id" : channel,
            "channel_id" : channel,
        },
    }).catch((e) => console.log(e));
};