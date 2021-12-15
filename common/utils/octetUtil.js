/**
 * Created by gunucklee on 2021. 08. 22.
 */
const axios = require('axios');
const {log} = require("debug");

const funcUtil = require('./funcUtil');

// 7일을 '초'로 변환
const SEVEN_DAYS_TIMESTAMP_SECOND = 604800;

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
              `v1/${funcUtil.getOctetSymbol()}/address`
            , data
            , accessToken
        );
    },

    // 옥텟 출금
    octetCreateWithdraw : async function(reqId, toAddress, amount, accessToken){
        data =  {
              "to" : toAddress
            , "amount" : amount
            , "reqId" : reqId
            , "passphrase" : `${funcUtil.getOctetPassPhrase()}`
            , "privateKey": `${funcUtil.getOctetPrivateKey()}`
        }
        return await octetPost(
            `v1/${funcUtil.getOctetSymbol()}/transfer`
            , data
            , accessToken
        );
    },

    // 주소 유효성 검증
    octetSelectAddressValidation : async function(address, accessToken){
        return await octetGet(
            `v1/${funcUtil.getOctetSymbol()}/address/${address}/validation`
            , null
            , accessToken
        );
    },


    // 수수료
    octetSelectFee : async function(accessToken){
        return await octetGet(
            `v1/ETH/fee`
            , null
            , accessToken
        );
    },



};


async function octetToken(accessToken) {
    console.log('asd;askldopaskdp' + funcUtil.getOctetApiPath());
    let tokenInfo = await octetGetToken(accessToken);
    console.log("OIWasdasdasdasdaQasdasdasJFOWEIF: " + tokenInfo['data']['formatUnixTimestampSecond']);
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
    return  await axios.post(`${funcUtil.getOctetApiPath()}${path}`, data
    ).catch((e) => console.log(e));
};

async function octetGet(path, data, accessToken){
    setAccessToken(accessToken);
    return  await axios.get(`${funcUtil.getOctetApiPath()}${path}`, data
    ).catch((e) => console.log(e));
};

async function octetPut(path, data, accessToken){
    setAccessToken(accessToken);
    return  await axios.put(`${funcUtil.getOctetApiPath()}${path}`, data
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