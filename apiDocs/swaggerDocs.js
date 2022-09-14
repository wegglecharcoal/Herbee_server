/**
 * Created by gunucklee on 2021. 09. 07.
 */
const express = require('express');
const app = express();

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const osUtil = require('../common/utils/osUtil');
const funcUtil = require('../common/utils/funcUtil');
const path = require("path");

let private_ip = osUtil.getIpAddress();

let description_text = `
## IP 체크 : ${private_ip} -> ${funcUtil.getServerType()}

## 서버 정보
    * 테스트 서버 정보
        * url : ${process.env.DEV_PUBLIC_IP}
        * port : ${process.env.PORT}
    * ex) http://${process.env.DEV_PUBLIC_IP}:${process.env.PORT}/api-docs/
    
    * 운영 서버 정보
        * dns : 미정
        * url : ${process.env.REAL_PUBLIC_IP}
        * port : ${process.env.PORT}
    * ex) http://${process.env.REAL_PUBLIC_IP}:${process.env.PORT}/api-docs/
    
## path 정보
    * /api/public/* : 로그인 하지 않은 상태에서 접근 가능
    
    * /api/private/* : 로그인 하지 않은 상태에서 접근 불가능
        * header 에 access_token 값 필수
        
## Header 정보
    * access_token
        * 접속 토큰
        * 회원가입/회원가입 여부 체크시 발급
        
## 파일(이미지, 영상)
    * 테스트 서버 파일 경로 
        * default url: ${process.env.DEV_FILE_PATH}
        * db filed: [abcd.png]
        * 샘플) ${process.env.DEV_FILE_PATH}abcd.png
        
    * 운영 서버 파일 경로 
        * default url: ${process.env.REAL_FILE_PATH}
        * 샘플) ${process.env.REAL_FILE_PATH}abcd.png
        
    * 테스트 서버 MEDIA CONVERT 파일 경로 (워터마크 영상, 썸네일 이미지)
        * default url: ${process.env.DEV_CONVERT_FILE_PATH}
        * db filed: [abcd.png]
        * 샘플) ${process.env.DEV_CONVERT_FILE_PATH}abcd.png
        
    * 운영 서버 MEDIA CONVERT 파일 경로 (워터마크 영상, 썸네일 이미지)
        * default url: ${process.env.REAL_CONVERT_FILE_PATH}
        * 샘플) ${process.env.REAL_CONVERT_FILE_PATH}abcd.png
        
## 꿀 메뉴얼 코드
        
        [ 제목 / 꿀 보상 갯수 / 메뉴얼 코드 ]
        
    * 무료 꿀 (지급)
        1. 피드업로드 사진 / 1개 / H0-001
        2. 피드업로드 동영상 / 3개 / H0-002
        3. 만남인증 / 10개 / H0-003
        4. 추천인 입력 / 10개 / H0-005
    
    * 지불 꿀 (차감)
        1. 메시지 / 3개 / H1-001
        2. 약속장소 잡기 / 5개 / H1-002
        3. 대화방 살리기 / 10개 / H1-003
        4. 동네모임 개설 / 5개 / H1-004
        5. 동네모임 가입 / 1개 / H1-005
        6. 만남 지역 넓히기 / 15개 / H1-006
        
    * 환불 꿀 (지급)
        1. 약속 거절 / 2개 / H2-001
        2. 채팅 제안 거절 / 3개 / H2-002
        3. 약속 제안 자동 취소 (6시간 안에 수락 안하면 자동 전액 환불) / 5개 / H2-003
        4. 채팅 제안 자동 취소 (1일 안에 수락 안하면 자동 전액 환불) / 3개 / H2-004
        

## 이용 약관
    * 서비스 이용약관 => http://weggle.kr/terms/service.html
    
    * 개인정보처리방침 => http://weggle.kr/terms/privacy.html
    
## 응답 메세지
    * 응답 형식 : json
    
    * HTTP Status Code
        * 200: 성공
        * 400: 실패
        
    * 에러코드 (HTTP Status Code - 400)
        * 200: 서버 시스템 및 db 에러 발생
        * 201: 존재하지 않는 API 경로
        * 400: 에러
        * 401: 파라미터 에러
        * 402: 파라미터 에러( 헤더 )
        * 403: 데이터 없음
        * 404: 인증 오류
        * 405: 이미 존재함
        * 406: 이미 존재함 - 이메일
        * 407: 이미 존재함 - 연락처
        * 408: 탈퇴
        * 409: 존재하지 않음 - 이메일
        * 410: 존재하지 않음 - 연락처
        * 411: 보내기 실패
        * 412: 시간 오류
        
    * 에러샘플 ( type - json ):
        {
            method: "GET",
            url: "/api/user",
            code : 201,
            message : "존재하지 않는 API 경로 입니다."
        }
        
## 테스트 유저 정보
    * access_token : abcd1234abcd1234
`;

let swaggerDefinition = {
    info: {
        version: '20210909.1',
        host: osUtil.getIpAddress(),
        // host: '13.209.247.11',   // 본 서버

        basePath: '/',

        title: '헐비 API 문서',
        description: description_text,
        contact: {
            name: 'API Support',
            email: 'developergunuck@gmail.com',
        },
    },

    securityDefinitions: {
        // user_uid: {
        //     "type": "apiKey",
        //     "name": "user_uid",
        //     "in": "header"
        // },
        access_token: {
            "type": "apiKey",
            "name": "access_token",
            "in": "header"
        },
    },
    security: [
        {
            // user_uid: [],
            access_token: [],
        }
    ],
    schemes: [
        "http",
        // "https",
    ],
    tags: [
        {
            name: 'Dev',
            description: '개발 테스트용 API'
        },
        {
            name: 'User',
            description: '유저 관련 API'
        },
        {
            name: 'Feed',
            description: '피드 관련 API'
        },
        {
            name: 'Lifestyle',
            description: '라이프스타일 관련 API'
        },
        {
            name: 'BalanceGame',
            description: '밸런스게임 관련 API'
        },
        {
            name: 'LocalReview',
            description: '동네후기 관련 API'
        },
        {
            name: 'ChatRoom',
            description: '채팅방 관련 API'
        },
        {
            name: 'Promise',
            description: '약속 관련 API'
        },
        {
            name: 'Address',
            description: '주소 관련 API'
        },
        {
            name: 'Comment',
            description: '댓글 관련 API'
        },
        {
            name: 'Follow',
            description: '팔로우 관련 API'
        },
        {
            name: 'Like',
            description: '좋아요 관련 API'
        },
        {
            name: 'Report',
            description: '신고 관련 API'
        },
        {
            name: 'Block',
            description: '차단 관련 API'
        },
        {
            name: 'Alert',
            description: '알림 관련 API'
        },
        {
            name: 'Honey',
            description: '꿀 관련 API'
        },
        {
            name: 'Notice',
            description: '공지사항 관련 API'
        },
        {
            name: 'Octet',
            description: '옥텟 관련 API'
        },
        {
            name: 'File',
            description: '파일(이미지, 영상) 관련 API'
        },

    ],
};
// options for swagger jsdoc
let options = {
    swaggerDefinition: swaggerDefinition, // swagger definition
    apis: [
        // path: path.join(__dirname, '.env')},
        // {path: path.join(__dirname, '.env')},
        './routes/**/*.js',
        './apiDocs/*.js',
    ], // path where API specification are written
};
// initialize swaggerJSDoc
let swaggerSpec = swaggerJSDoc(options);

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
