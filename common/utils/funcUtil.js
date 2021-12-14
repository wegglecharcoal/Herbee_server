/**
 * Created by gunucklee on 2021. 09. 08.
 */
const osUtil = require('./osUtil');

module.exports = {

    isRealServer: _isRealServer(),
    getServerType: function () {
        return _isRealServer() ? 'real_server' : 'test_server';
    },
    getFilePath: function (){
        return _isRealServer() ? process.env.REAL_FILE_PATH : process.env.DEV_FILE_PATH;
    },
    getConvertFilePath: function (){
        return _isRealServer() ? process.env.REAL_CONVERT_FILE_PATH : process.env.DEV_CONVERT_FILE_PATH
    },

    /**
     * DB function
     * @returns {*}
     */
    getDBHost: function (){
        return _isRealServer() ? process.env.REAL_DB_HOST : process.env.DEV_DB_HOST;
    },
    getDBUser: function (){
        return _isRealServer() ? process.env.REAL_DB_USER : process.env.DEV_DB_USER;
    },
    getDBPassword: function (){
        return _isRealServer() ? process.env.REAL_DB_PASS : process.env.DEV_DB_PASS;
    },
    getDBSchema: function (){
        return _isRealServer() ? process.env.REAL_DB_SCHEMA : process.env.DEV_DB_SCHEMA;
    },




    /**
     * AWS function
     * @returns {*}
     */
    getAWSAccessKeyID: function (){
        return _isRealServer() ? process.env.REAL_AWS_ACCESS_KEY_ID : process.env.DEV_AWS_ACCESS_KEY_ID;
    },
    getAWSSecretAccessKey: function(){
        return _isRealServer() ? process.env.REAL_AWS_SECRET_ACCESS_KEY : process.env.DEV_AWS_SECRET_ACCESS_KEY;
    },
    getAWSRegion: function(){
        return _isRealServer() ? process.env.REAL_AWS_REGION : process.env.DEV_AWS_REGION;
    },
    getAWSBucket: function(){
        return _isRealServer() ? process.env.REAL_AWS_BUCKET : process.env.DEV_AWS_BUCKET;
    },
    getFilePath: function(){
        return _isRealServer() ? process.env.REAL_FILE_PATH : process.env.DEV_FILE_PATH;
    },


    /**
     * AWS Media Convert
     * @returns {*}
     */
    getAWSMediaConvertEndPoint: function() {
        return  _isRealServer() ? process.env.REAL_AWS_MEDIA_CONVERT_ENDPOINT : process.env.DEV_AWS_MEDIA_CONVERT_ENDPOINT;
    },
    getAWSMediaConvertQueue: function() {
        return  _isRealServer() ? process.env.REAL_AWS_MEDIA_CONVERT_QUEUE : process.env.DEV_AWS_MEDIA_CONVERT_QUEUE;
    },
    getAWSMediaConvertRole: function() {
        return _isRealServer() ? process.env.REAL_AWS_MEDIA_CONVERT_ROLE : process.env.DEV_AWS_MEDIA_CONVERT_ROLE;
    },
    getAWSMediaConvertS3StartingPoint: function() {
        return _isRealServer() ? process.env.REAL_AWS_MEDIA_CONVERT_S3_STARTING_POINT : process.env.DEV_AWS_MEDIA_CONVERT_S3_STARTING_POINT;
    },
    getAWSMediaConvertS3Destination: function() {
        return _isRealServer() ? process.env.REAL_AWS_MEDIA_CONVERT_S3_DESTINATION : process.env.DEV_AWS_MEDIA_CONVERT_S3_DESTINATION;
    },

    /**
     * fcm key
     */
    getFCMKey: function() {
        return _isRealServer() ? process.env.REAL_FCM_KEY : process.env.DEV_FCM_KEY;
    },

    /**
     * Octet Coin
     */
    getOctetPassPhrase: function() {
        return _isRealServer() ? process.env.REAL_OCTET_PASSPHRASE : process.env.DEV_OCTET_PASSPHRASE;
    },
    getOctetPrivateKey: function() {
        return _isRealServer() ? process.env.REAL_OCTET_PRIVATEKEY : process.env.DEV_OCTET_PRIVATEKEY;
    },
    getOctetSymbol: function() {
        return _isRealServer() ? process.env.REAL_OCTET_SYMBOL : process.env.DEV_OCTET_SYMBOL;
    },
    getOctetApiPath: function() {
        return _isRealServer() ? process.env.REAL_OCTET_API_PATH : process.env.DEV_OCTET_API_PATH;
    }

}

function _isRealServer(){
    return osUtil.getIpAddress() === process.env.REAL_PRIVATE_IP;
}
