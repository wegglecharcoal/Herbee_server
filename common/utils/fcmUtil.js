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

    fcmVideoCommentSingle : async function(item){
        return  await axios.post('https://fcm.googleapis.com/fcm/send', {
            "to": item['push_token'],
            "priority": "high",
            "data": {
                "title": "댓글 등록 알림",
                "message": `${item['nickname']}님이 회원님의 영상에 댓글을 달았습니다. : ${item['content']}`,
                "channel" : "댓글 알림",
                "video_uid" : `${item['video_uid']}`,
                "fcm_type" : "0",
                "video_from" : `${item['is_deal']}`,
            }
        }).catch((e) => console.log(e));
    },
    fcmNestedCommentSingle : async function(item){
        return  await axios.post('https://fcm.googleapis.com/fcm/send', {
            "to": item['push_token'],
            "priority": "high",
            "data": {
                "title": "대댓글 등록 알림",
                "message": `${item['user_nickname']}님이 회원님의 댓글에 대댓글을 달았습니다. : ${item['comment_content']}`,
                "channel" : "대댓글 알림",
                "fcm_type" : "1",
                "video_from" : `${item['is_deal']}`,
            }
        }).catch((e) => console.log(e));
    },

};