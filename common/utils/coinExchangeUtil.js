/**
 * Created by gunucklee on 2021. 12. 15.
 */
const axios = require('axios');
const {log} = require("debug");

axios.defaults.headers.post['Content-Type'] = 'application/json';

module.exports = {

    // 출금 수수료
    upBitSelectCoinPrice : async function(markets){
        return await upBitGet(
            `v1/ticker?markets=${markets}`//?markets=KRW-ETH
            , null
        );
    },

    // Bee Coin 비율
    lBankSelectCoinRate : async function(coin_name){
        let coin_info = await lBankGet(
            `v2/ticker/24hr.do?symbol=${coin_name}`//?coin_name=bee_usdt
            , null
        );

        return coin_info['data']['result'] === 'true' ?
            parseFloat(coin_info['data']['data'][0]['ticker']['latest']) : coin_info['data']['result'];
    },

};

async function upBitGet(path, data){
    return  await axios.get(`https://api.upbit.com/${path}`, data
    ).catch((e) => console.log(e));
};

async function lBankGet(path, data){
    return  await axios.get(`https://api.lbkex.com/${path}`, data
    ).catch((e) => console.log(e));
};
