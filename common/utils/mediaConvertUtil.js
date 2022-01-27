/**
 * Created by gunucklee on 2021. 11. 15.
 */

const AWS = require("aws-sdk");

const path = require('path');
const paramUtil = require('./paramUtil');
const funcUtil = require('./funcUtil');
const sendUtil = require('./sendUtil');
const errUtil = require('./errUtil');
const errCode = require('../define/errCode');

module.exports =  function (file_size, final_name) {

    const MEDIACONVERT = 'ConvertSuccess';
    const BITRATE = 1600000;
    const extname = path.extname(final_name);


    if(extname === '.mp4') {

        let bitrate_value = BITRATE;
        if(file_size > 30)
            bitrate_value = BITRATE * ( 30 / file_size );

        if(bitrate_value < 500000) {
            bitrate_value = 500000;
        }

        AWS.config.update({
            accessKeyId: funcUtil.getAWSAccessKeyID(),
            secretAccessKey: funcUtil.getAWSSecretAccessKey(),
            region : funcUtil.getAWSRegion(),
        });

        AWS.config.mediaconvert = {endpoint: funcUtil.getAWSMediaConvertEndPoint()}

        const params = {
            "Queue": funcUtil.getAWSMediaConvertQueue(),
            "UserMetadata": {
                "Customer": "Amazon"
            },
            "Role": funcUtil.getAWSMediaConvertRole(),
            "Settings": {
                "TimecodeConfig": {
                    "Source": "ZEROBASED"
                },
                "OutputGroups": [
                    {
                        "CustomName": "grege",
                        "Name": "File Group",
                        "Outputs": [
                            {
                                "ContainerSettings": {
                                    "Container": "MP4",
                                    "Mp4Settings": {
                                        "CslgAtom": "EXCLUDE",
                                        "FreeSpaceBox": "EXCLUDE",
                                        "MoovPlacement": "NORMAL"
                                    }
                                },
                                "VideoDescription": {
                                    "Width": 574,
                                    "ScalingBehavior": "DEFAULT",
                                    "Height": 1024,
                                    "VideoPreprocessors": {
                                        "Deinterlacer": {
                                            "Algorithm": "INTERPOLATE",
                                            "Mode": "DEINTERLACE",
                                            "Control": "NORMAL"
                                        }
                                    },
                                    "TimecodeInsertion": "DISABLED",
                                    "AntiAlias": "ENABLED",
                                    "Sharpness": 50,
                                    "CodecSettings": {
                                        "Codec": "H_264",
                                        "H264Settings": {
                                            "ParNumerator": 16,
                                            "ParDenominator": 9,
                                            "Bitrate": bitrate_value
                                        }
                                    },
                                    "AfdSignaling": "NONE",
                                    "DropFrameTimecode": "ENABLED",
                                    "RespondToAfd": "NONE",
                                    "ColorMetadata": "INSERT"
                                },
                                "AudioDescriptions": [
                                    {
                                        "AudioTypeControl": "FOLLOW_INPUT",
                                        "CodecSettings": {
                                            "Codec": "AAC",
                                            "AacSettings": {
                                                "AudioDescriptionBroadcasterMix": "NORMAL",
                                                "Bitrate": 160000,
                                                "RateControlMode": "CBR",
                                                "CodecProfile": "LC",
                                                "CodingMode": "CODING_MODE_2_0",
                                                "RawFormat": "NONE",
                                                "SampleRate": 48000,
                                                "Specification": "MPEG4"
                                            }
                                        },
                                        "LanguageCodeControl": "FOLLOW_INPUT",
                                        "AudioType": 0
                                    }
                                ],
                                // "NameModifier": "test1111"
                                "NameModifier": "ConvertSuccess"
                            },
                            {
                                "ContainerSettings": {
                                    "Container": "RAW"
                                },
                                "VideoDescription": {
                                    "Width": 574,
                                    "Height": 1024,
                                    "CodecSettings": {
                                        "Codec": "FRAME_CAPTURE",
                                        "FrameCaptureSettings": {
                                            "FramerateNumerator": 30,
                                            "FramerateDenominator": 90,
                                            "MaxCaptures": 2,
                                            "Quality": 80
                                        }
                                    }
                                },
                                "Extension": "jpg",
                                "NameModifier": "Thumbnail"
                            }
                        ],
                        "OutputGroupSettings": {
                            "Type": "FILE_GROUP_SETTINGS",
                            "FileGroupSettings": {
                                "Destination": funcUtil.getAWSMediaConvertS3Destination()
                            }
                        }
                    }
                ],
                "Inputs": [
                    {
                        "AudioSelectors": {
                            "Audio Selector 1": {
                                "DefaultSelection": "DEFAULT"
                            }
                        },
                        "VideoSelector": {
                            "Rotate": "AUTO"
                        },
                        "TimecodeSource": "ZEROBASED",
                        "FileInput": "null"
                    }
                ]
            },
            "AccelerationSettings": {
                "Mode": "DISABLED"
            },
            "StatusUpdateInterval": "SECONDS_60",
            "Priority": 0,
            "HopDestinations": []
        }
        const data = convertFunc(final_name, params);

        if(data) {
            let basename = path.basename(final_name, extname);
            basename += MEDIACONVERT;
            final_name = basename + extname;
            return final_name;
        }




        // 한글 버전 (추후 반영 예정)
        // errUtil.createCall(errCode.fail, `영상 업로드 중 오류가 발생되었습니다. 다시 시도해주세요.!`);

        // 영어 버전
        errUtil.createCall(errCode.fail, `An error occurred while uploading the video. Please try again!`);
        return;
    }
    return final_name;
}





async function convertFunc(final_name,convertParams) {
    console.log(JSON.stringify(convertParams));

    convertParams.Settings.Inputs[0].FileInput = `${funcUtil.getAWSMediaConvertS3StartingPoint()}${final_name}`;

    const endpointPromise = new AWS.MediaConvert().createJob(convertParams).promise();

    endpointPromise.then(
        function(data) {
            console.log("Job created! ", data);
            return data;
        },
        function(err) {
            console.log("Error", err);
        }
    );
}