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

module.exports =  function (final_name, video_width, video_height) {

    const MEDIACONVERT = 'ConvertSuccess';
    const extname = path.extname(final_name);



    if(extname === '.mp4') {

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
                                            "Bitrate": 1500000
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
                                "NameModifier": "ConvertSuccess"
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
                        // "FileInput": "s3://weggle-bucket/2a737e2ea36d9dabaab1a904e1c06beb.mp4"
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

        console.log("asdiajdoqwijdqowij: " + final_name)
        const data = convertFunc(final_name, params);

        if(data) {
            let basename = path.basename(final_name, extname);
            basename += MEDIACONVERT;
            final_name = basename + extname;
            return final_name;
        }

        errUtil.createCall(errCode.fail, `영상 업로드 중 오류가 발생되었습니다. 다시 시도해주세요.!`);
        return;
    }
    return final_name;
}





async function convertFunc(final_name,convertParams) {

    // Create a promise on a MediaConvert object
    console.log(JSON.stringify(convertParams));

    // params.Settings.OutputGroups[0].Outputs[0].NameModifier = final_name;
    convertParams.Settings.Inputs[0].FileInput = `${funcUtil.getAWSMediaConvertS3StartingPoint()}${final_name}`;

    // params["OutputGroups"][0]["Outputs"][0]["NameModifier"] = final_name;


    const endpointPromise = new AWS.MediaConvert().createJob(convertParams).promise();

    // Handle promise's fulfilled/rejected status
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