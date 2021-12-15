/**
 * Created by gunucklee on 2021. 12. 15.
 */
const axios = require('axios');
const {log} = require("debug");

axios.defaults.headers.post['Content-Type'] = 'application/json';

module.exports = {

    // 수수료
    upBitSelectCoinPrice : async function(markets){
        return await upBitGet(
            `v1/ticker?markets=${markets}`//?markets=KRW-ETH
            , null
        );
    },
};

async function upBitGet(path, data){
    return  await axios.get(`https://api.upbit.com/${path}`, data
    ).catch((e) => console.log(e));
};
