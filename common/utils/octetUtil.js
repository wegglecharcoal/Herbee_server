/**
 * Created by gunucklee on 2021. 08. 22.
 */
const axios = require('axios');
const {log} = require("debug");

// 7일을 '초'로 변환
const SEVEN_DAYS_TIMESTAMP_SECOND = 604800;
// const SEVEN_DAYS_TIMESTAMP_SECOND = 9999999999999999999999999;
const TOKEN_SYMBOL = 'DDC'

let data = {};
axios.defaults.headers.common['Authorization'];
axios.defaults.headers.post['Content-Type'] = 'application/json';

module.exports = {

    // API 토큰 유효기간 확인
    octetToken : octetToken,

    // 자신 주소 등록
    octetCreateAddress : async function(account,accessToken){
        data =  {
            "account" : account
          , "addressType" : "EOA"

        }
        return await octetPost(
              `v1/${TOKEN_SYMBOL}/address`
            , data
            , accessToken
        );
    },

    // 자신 주소 등록
    octetCreateWithdraw : async function(user_uid, toAddress, amount, accessToken){
        data =  {
              "to" : toAddress
            , "amount" : amount
            , "reqId" : `${user_uid}@${Math.floor(new Date().getTime()) + 1}`
            , "passphrase" : `${process.env.OCTET_PASSPHRASE}`
            , "privateKey": `${process.env.OCTET_PRIVATEKEY}`
        }
        return await octetPost(
            `v1/${TOKEN_SYMBOL}/transfer`
            , data
            , accessToken
        );
    },

};


async function octetToken(accessToken) {

    let tokenInfo = await octetGetToken(accessToken);

    // 토큰 유효기간이 지나면 새 토큰 발행, 유효할 시 기존 토큰 활용
    if( tokenInfo['data']['formatUnixTimestampSecond'] < SEVEN_DAYS_TIMESTAMP_SECOND ) {
        accessToken = await octetCreateToken(accessToken);
        return accessToken['data']['token'];
    }

    return 'maintain';

}
async function octetGetToken(accessToken) {
    return await octetGet(
        'v1/user/tokeninfo'
        ,null
        , accessToken
    );
}

// API 토큰 발급
async function octetCreateToken(accessToken) {
    return await octetPost(
        'v1/user/issue-token'
        ,null
        , accessToken
    );
}

async function octetPost(path, data, accessToken){
    setAccessToken(accessToken);
    return  await axios.post(`https://dev.blockchainapi.pro/${path}`, data
    ).catch((e) => console.log(e));
};

async function octetGet(path, data, accessToken){
    setAccessToken(accessToken);
    return  await axios.get(`https://dev.blockchainapi.pro/${path}`, data
    ).catch((e) => console.log(e));
};

async function octetPut(path, data, accessToken){
    setAccessToken(accessToken);
    return  await axios.put(`https://dev.blockchainapi.pro/${path}`, data
    ).catch((e) => console.log(e));
};

function setAccessToken(accessToken) {
    if(accessToken) {
        axios.defaults.headers.common['Authorization'] = accessToken;
    }
    else {
        // delete axios.defaults.headers.common['Authorization']
    }

}