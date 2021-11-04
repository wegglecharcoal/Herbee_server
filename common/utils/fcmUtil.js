/**
 * Created by gunucklee on 2021. 08. 22.
 */
const axios = require('axios');
const {log} = require("debug");

// 바꿔야함 common
// axios.defaults.headers.common['Authorization'] = 'key=AAAAH1HxpKo:APA91bEGjPgOgXK2xZ-uqZHiR_PT69tO4knZt6ZCRpAXRESsnuY23MXWFneIQ-EALixYNkcUZg0iNczMW8eXc9ZLp6_dd1Kmz0t4rw5rJwboLwG-65hS0nyNps5OchEw72zP8dzlLNIa';
axios.defaults.headers.post['Content-Type'] = 'application/json';
// fcm_type
// 0: 댓글 등록 알림
// 1: 대댓글 등록 알림


module.exports = {

    fcmMsgSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "메시지 알림"
            , `${item['nickname']}님이 메시지를 보냈습니다.`
            , "메시지 알림"
            , "0"
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmFollowSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "팔로우 알림"
            , `${item['nickname']}님이 당신을 팔로우 했습니다.`
            , "팔로우 알림"
            , "1"
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmLikePostSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "게시물 좋아요 알림"
            , `${item['nickname']}님이 게시물에 좋아요를 눌렀습니다.`
            , "좋아요 알림"
            , "2"
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmLikeCommentSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "댓글 좋아요 알림"
            , `${item['nickname']}님이 댓글에 좋아요를 눌렀습니다.`
            , "좋아요 알림"
            , "2"
        );
    },
    fcmCommentSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "댓글 알림"
            , `${item['nickname']}님이 게시물에 댓글을 남겼습니다.`
            , "좋아요 알림"
            , "3"
        );
    },
    fcmPromiseCreateSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "약속 생성 알림"
            , `${item['nickname']}님이 약속을 잡았습니다.`
            , "약속 알림"
            , "4"
        );
    },
    fcmPromiseAcceptSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "약속 수락 알림"
            , `${item['nickname']}님이 약속을 수락했습니다.`
            , "약속 알림"
            , "4"
        );
    },
    fcmPromiseAfterAnHourSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "약속 한 시간 전 알림"
            , `${item['nickname']}님과의 약속 잊지 않으셨죠? 출발할 때 알려주세요.`
            , "약속 알림"
            , "4"
        );
    },
    fcmPromiseSingle : async function(item){
        return await fcmFunc(
              item['push_token']
            , "약속 한 시간 전 알림"
            , `${item['nickname']}님이 약속 장소로 향하고 있습니다.`
            , "약속 알림"
            , "4"
        );
    },
    fcmPromiseSingle : async function(item){
        return await fcmFunc(
            item['push_token']
            , "약속 한 시간 전 알림"
            , `${item['nickname']}님이 약속 장소로 향하고 있습니다.`
            , "약속 알림"
            , "4"
        );
    },
};



async function fcmFunc(token, title, message, channel, fcm_type){
    return  await axios.post('https://fcm.googleapis.com/fcm/send', {
        "to": token,
        "priority": "high",
        "data": {
            "title": title,
            "message": message,
            "channel" : channel,
            "fcm_type" : fcm_type,
        },
        "notification": {
            "title": title,
            "body": message,
            "channel" : channel,
            "fcm_type" : fcm_type,
            "sound" : "default",
            "badge": "1",
            "content-available" : "true",
            "apns-priority" : "5",
            "badge count" : "0",
        },
    }).catch((e) => console.log(e));
};