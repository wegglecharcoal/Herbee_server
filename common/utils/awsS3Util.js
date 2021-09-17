/**
 * Created by gunucklee on 2021. 09. 17.
 */
const path = require('path');
const multer  = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
const AWS = require("aws-sdk");

const funcUtil = require('./funcUtil');
const sendUtil = require('./sendUtil');
const errUtil = require('./errUtil');

AWS.config.update({
    accessKeyId: funcUtil.getAWSAccessKeyID(),
    secretAccessKey: funcUtil.getAWSSecretAccessKey(),
    region : funcUtil.getAWSRegion(),
});

const s3 = new AWS.S3();

const MAX_LENGTH_MB=30

const fileOptions = {
    storage: multerS3({
        s3: s3,
        bucket: `${funcUtil.getAWSBucket()}`,
        contentType: multerS3.AUTO_CONTENT_TYPE, // 자동을 콘텐츠 타입 세팅
        acl: 'public-read', // 클라이언트에서 자유롭게 가용하기 위함
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, getFilename(req, file));
        },
    }),
    limits: {
        fileSize: 1024 * 1024 * MAX_LENGTH_MB, // {n}mb 이하만,
        files: 1
    },
};

function getFilename(req, file){

    let originalname = file.originalname
    if(file.originalname.includes('.mp4'))
        originalname = replaceName(file.originalname);

    console.log("s3util :" + originalname)

    let extension = path.extname(originalname);
    let basename = path.basename(originalname, extension);        //확장자 .jpg 만 빠진 파일명을 얻어온다
    let hash_name = crypto.createHash('md5').update(Date.now()+basename).digest("hex");
    return `${hash_name}${extension}`;
}

function replaceName(filename) {


    let fileArray = filename.split("_")

    filename =filename.replace('_' + fileArray[fileArray.length -2], '')

    filename =filename.replace('_' + fileArray[fileArray.length -1], '')

    console.log("idjkw: " +filename)
    return filename;
}

function uploadFile(req, res, next){

    console.log('awsS3Util, uploadFile start ..............');
    let single = multer(fileOptions).single('file');
    single(req, res, function (err) {
        if(err){

            console.log('awsS3Util, multer err.code : '+err.code);
            console.log('awsS3Util, multer err.stack : '+err.stack);

            if( err.code === 'LIMIT_FILE_SIZE' ){
                sendUtil.sendErrorPacket(req, res, errUtil.initError(err.path, `최대 업로드 가능한 파일 사이즈는 ${MAX_LENGTH_MB}mb 입니다.`));
            }
            else {
                sendUtil.sendErrorPacket(req, res, err);
            }
        }
        else {
            next();
        }
    })
}






exports.uploadFile = uploadFile;
