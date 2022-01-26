/**
 * Created by gunucklee on 2021. 09. 17.
 *
 * @swagger
 * /api/public/file:
 *   post:
 *     summary: 파일 업로드 (1개씩만 업로드 가능)
 *     tags: [File]
 *     description: |
 *       path : /api/public/file
 *
 *       * 파일 (이미지,영상) 업로드 (1개씩만 업로드 가능)
 *       * 서버에 오직 파일만 올리뒤 파일명을 받는 api
 *       * 이미지의 경우 500kb 이하
 *       * 영상의 경우 2mb 이하(더 작으면 좋을거 같습니다.)
 *
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: |
 *           이미지 or 영상 파일
 *     responses:
 *       200:
 *         description: 결과 정보
 *
 */
const sendUtil = require('../../../common/utils/sendUtil');
const paramUtil = require('../../../common/utils/paramUtil');
const fileUtil = require('../../../common/utils/fileUtil');
const errUtil = require('../../../common/utils/errUtil');
const logUtil = require('../../../common/utils/logUtil');
const errCode = require('../../../common/define/errCode');
const funcUtil = require('../../../common/utils/funcUtil');

const mediaConvertUtil = require('../../../common/utils/mediaConvertUtil');

const getMediaDimensions = require('get-media-dimensions');

let file_name = fileUtil.name(__filename);

/**
 * 결과 값을 처리하기 위한 - 전역 변수
 */
module.exports = async function (req, res) {
    const _funcName = arguments.callee.name;

    logUtil.printUrlLog(req, `header: ${JSON.stringify(req.headers)}`);
    try {
        req.file_name = file_name;
        req.paramBody = paramUtil.parse(req);

        console.log('upload file awsS3 function start........................');
        if( req.file ) {

            let final_name = req.file.key;

            req.innerBody = {};

            if(req.file.originalname.includes('.mp4')) {

                let file_size = req.file.size / (1024 * 1024);

                const file_dimensions = await getMediaDimensions(`${funcUtil.getFilePath()}${req.file.key}`, 'video');

                final_name = mediaConvertUtil(file_size, final_name);

                req.innerBody['thumbnail'] = final_name.replace('ConvertSuccess.mp4', file_dimensions['duration'] >= 4? 'Thumbnail.0000001.jpg' : 'Thumbnail.0000000.jpg');
            }

            req.innerBody['filename'] = final_name;

            sendUtil.sendSuccessPacket(req, res, req.innerBody, true);

        }
        else {
            let _err = errUtil.initError(errCode.empty, '이미지 파일이 존재하지 않습니다.');
            sendUtil.sendErrorPacket(req, res, _err);
        }

    }
    catch (e) {
        console.log(`===>>> catch e: ${e}`);
        console.log(`===>>> catch e.stack: ${e.stack}`);
        let _err = errUtil.get(e);
        sendUtil.sendErrorPacket(req, res, _err);
    }
}

