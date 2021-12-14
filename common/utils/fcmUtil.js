/**
 * Created by gunucklee on 2021. 08. 22.
 */
const axios = require('axios');
const {log} = require("debug");
const funcUtil = require('./funcUtil')
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
              item['fcm_push_token_list']
            , "메시지 알림"
            , `${item['fcm_nickname']}님이 메시지를 보냈습니다.`
            , "메시지"
            , "0"
            , item['fcm_filename']
            , item['fcm_target_uid']
            , null
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmFollowSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token']]
            , "팔로우 알림"
            , `${item['fcm_nickname']}님이 당신을 팔로우 했습니다.`
            , "팔로우"
            , "1"
            , item['fcm_filename']
            , item['fcm_target_uid']
            , null
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmLikePostSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token']]
            , "게시물 좋아요 알림"
            , `${item['fcm_nickname']}님이 게시물에 좋아요를 눌렀습니다.`
            , "좋아요"
            , "2"
            , item['fcm_filename']
            , item['fcm_target_uid']
            , item['fcm_type']
        );
    },
    // 중복 처리 해결 해주어야 함 연속으로 눌렀을 때
    fcmLikeCommentSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token']]
            , "댓글 좋아요 알림"
            , `${item['fcm_nickname']}님이 댓글에 좋아요를 눌렀습니다.`
            , "좋아요"
            , "2"
            , item['fcm_filename']
            , item['fcm_target_uid']
            , item['fcm_type']
        );
    },
    fcmCommentSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token']]
            , "댓글 알림"
            , `${item['fcm_nickname']}님이 게시물에 댓글을 남겼습니다.`
            , "댓글"
            , "3"
            , item['fcm_filename']
            , item['fcm_target_uid']
            , item['fcm_type']
        );
    },
    fcmPromiseCreateArray : async function(item){
        return await fcmFunc(
              [item['fcm_push_token_list']]
            , "약속 생성 알림"
            , `${item['fcm_nickname']}님이 약속을 잡았습니다.`
            , "약속"
            , "4"
            , item['fcm_filename']
            , null
            , null
        );
    },
    fcmPromiseAcceptSingle : async function(item){
        return await fcmFunc(
              [item['fcm_push_token']]
            , "약속 수락 알림"
            , `${item['fcm_nickname']}님이 약속을 수락했습니다.`
            , "약속"
            , "4"
            , item['fcm_filename']
            , item['fcm_target_uid']
        );
    },
    fcmPromiseAfterAnHourSingle : async function(item){
        return await fcmFunc(
              [item['push_token']]
            , "약속 한 시간 전 알림"
            , `${item['nickname']}님과의 약속 잊지 않으셨죠? 출발할 때 알려주세요.`
            , "약속"
            , "4"
            , item['filename']
            , item['fcm_target_uid']
        );
    },
    fcmPromiseSingle : async function(item){
        return await fcmFunc(
            [item['push_token']]
            , "약속 한 시간 전 알림"
            , `${item['nickname']}님이 약속 장소로 향하고 있습니다.`
            , "약속"
            , "4"
            , item['filename']
            , item['fcm_target_uid']
        );
    },
    fcmPromiseDepartSingle : async function(item){
        return await fcmFunc(
              [item['push_token']]
            , "약속 출발"
            , `${item['nickname']}님과의 약속 어떠셨나요?`
            , "약속"
            , "4"
            , item['filename']
            , item['fcm_target_uid']
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