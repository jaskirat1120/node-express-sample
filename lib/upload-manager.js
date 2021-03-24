let CONSTANTS = require('../config/storage-conf');
let RESPONSE_MSG = require('../config/constants').responseMessages;
let Path = require('path');
let request = require('request');
let winston = require('winston');
const Fs = require('fs');
let AWS = require('aws-sdk');
const sharp = require('sharp');
const sizeOf = require('image-size');
const ffmpeg = require('ffmpeg');
let accessKeyId = CONSTANTS.AWS_S3.accessKeyId;
let secretAccessKeyId = CONSTANTS.AWS_S3.secretAccessKey;
let bucketName = CONSTANTS.AWS_S3.bucket;
let region = CONSTANTS.AWS_S3.region;
let bucketFolder = CONSTANTS.AWS_S3.folder;

AWS.config.update({accessKeyId: accessKeyId, secretAccessKey: secretAccessKeyId});


let s3 = new AWS.S3();


async function s3PutObject(folder, fileName, data, mimeType, disposition) {
    console.log("======mimeType=============", mimeType);

    let params = {
        Bucket: bucketName,
        Key: folder + '/' + fileName,
        Body: data,
        ACL: 'public-read',
        ContentType: mimeType,
    };
    console.log("dispositiondisposition",disposition)
    if (disposition) {
        params["ContentDisposition"] = disposition;
    }

    console.log("paramsparamsparamsparamsparams", params);

    await s3.putObject(params).promise();

    return {};
}

/*
 Save File on the disk
 */


let uploadFile = async (fileBuffer, originalPicFolder, thumbnailPicFolder,
                        processedPicFolder, thumbnailMedPicFolder, fileName,
                        mimeType, fileExtension, videoOriginalFolder,
                        videoThumbnailFolder, audioOriginalFolder, documentFolder, videoThumbName) => {
    console.log("In Upload File", mimeType.split("/")[0]);

    try {
        let promises = [];
        if (mimeType.split("/")[0] == "image") {
            promises = [];

            console.log("============inside============", fileBuffer);
            let dimensions = await sizeOf(fileBuffer);
            console.log("dimensions", dimensions);

            let originalImage = await uploadOriginalImage(fileBuffer, originalPicFolder, fileName, mimeType);

            let quality = {quality: 50};
            let buffer = await uploadProcessedImage(fileBuffer, processedPicFolder, fileName, mimeType, fileExtension, quality);

            console.log("bufferbufferbufferbuffer", buffer);

            dimensions.width = 300;
            console.log("dimensionsdimensions", dimensions);

            promises.push(uploadThumbnailImage(buffer, thumbnailPicFolder, fileName, mimeType, dimensions, 1, quality, fileExtension));

            dimensions.width = 800;
            promises.push(uploadThumbnailImage(buffer, thumbnailMedPicFolder, fileName, mimeType, dimensions, 1, quality, fileExtension));
        } else if (mimeType.split("/")[1] == "pdf" || mimeType.split("/")[1] == "doc" || mimeType.split("/")[1] == "docx" || mimeType.split("/")[1] == "xls" || mimeType.split("/")[1] == "csv") {
            promises = [];

            console.log("============inside============ Doc type");
            // let dimensions = await sizeOf(fileBuffer);
            promises.push(uploadFileOnS3BucketAfterRead('', fileName, {}, mimeType, fileBuffer, documentFolder));
        } else {
            if (mimeType.split("/")[0] == "video") {
                let thumbnailName = videoThumbName;
                console.log("thumbName", thumbnailName);
                promises = [
                    uploadOriginalImage(fileBuffer, videoOriginalFolder, fileName, mimeType, fileExtension),
                    uploadThumbnailVideo(fileBuffer, videoThumbnailFolder, fileName, mimeType, fileExtension, thumbnailName)
                ];
            } else if (mimeType.split("/")[0] == "audio") {
                // let disposition = "inline";

                promises = [uploadOriginalImage(fileBuffer, audioOriginalFolder, fileName, mimeType, fileExtension,"", "")];
            } else {
                throw RESPONSE_MSG.STATUS_MSG.ERROR.INVALID_FILE_TYPE;
            }
        }
        let [thumbnailPic, thumbnailPicMed, processedPic] = await Promise.all(promises);

        return {};

    } catch (err) {
        console.log("===================err===========", err);
        return err;
    }
};

async function uploadProcessedImage(fileBuffer, thumbnailPicFolder, fileName, mimeType, fileExtension, quality) {
    console.log('fileExtension', fileExtension, fileBuffer);
    try {
        let s3bucket = new AWS.S3();
        let data;
        if (fileExtension == "png") {
            data = await sharp(fileBuffer)
                // .max()
                .toFormat('png', quality)
                .toBuffer();
        } else {
            console.log('fileBuffer', fileBuffer);
            data = await sharp(fileBuffer)
                // .max()
                .toFormat('jpg', quality)
                .toBuffer();
        }
        await s3PutObject(thumbnailPicFolder, fileName, data, mimeType);
        return data;
    } catch (err) {
        console.log(" upload file errore sfjksdkjk;fsdjf 8888888 ");
        winston.error("err-->>", err);
    }
}

async function uploadThumbnailImage(fileBuffer, thumbnailPicFolder, fileName, mimeType, dimensions
    , compressLevelRatio, quality, fileExtension, folder) {
    try {
        let data;
        if (fileExtension == "png") {
            let imgSize;
            data = await sharp(fileBuffer)
                .resize(dimensions.width)
                // .min()
                .toFormat('png', quality)
                .toBuffer();
        } else {

            console.log("===============inside==============", fileBuffer);
            data = await sharp(fileBuffer)
                .resize(dimensions.width)
                // .min()
                .toFormat('jpeg', quality)
                .toBuffer();
        }
        await s3PutObject(thumbnailPicFolder, fileName, data, mimeType);

    } catch (err) {
        winston.error("err-->>", err);
    }
    // return {};


}

const uploadFileOnS3BucketAfterRead = async (filePath, fileName, reportData, mimeType1, buffer, folder) => {
    try {
        console.log("filePath",filePath)
        let fileBuffer;
        if (buffer) {
            fileBuffer = buffer;
        } else {
            fileBuffer = await readdirAsync(filePath);
        }
        console.log("fileBuffer", fileBuffer);
        let s3bucket = new AWS.S3();
        let mimeType = "application/pdf";
        if (mimeType1) {
            mimeType = mimeType1;
            // console.log("========mimeType1=================",mimeType)
        }
        let uploadPath = folder + "/" + fileName;

        let params = {
            Bucket: bucketName,
            Key: uploadPath,
            Body: fileBuffer,
            ACL: 'public-read',
            ContentType: mimeType
        };
        await s3bucket.putObject(params).promise();
        return '';
    } catch (err) {
        winston.error("err-->>", err);
    }
};

async function uploadMultipart(fileBuffer, folder, fileName, mimeType, fileSize, disposition) {
    console.log("===============mimeType", mimeType);

    let s3bucket = new AWS.S3(),
        paramsData = [];

    try {
        let createMultipart = await s3bucket.createMultipartUpload({
            Bucket: bucketName,
            Key: folder + '/' + fileName,
            ACL: 'public-read',
            ContentType: mimeType,
            ...(disposition && {"ContentDisposition": disposition})
        }).promise();

        let partSize = 5242880,
            parts = Math.ceil(fileSize / partSize);

        for (let partNum = 0; partNum < parts; partNum++) {            // chain four more times

            let rangeStart = partNum * partSize,
                end = Math.min(rangeStart + partSize, fileSize);

            let updatedBuffer = fileBuffer.slice(rangeStart, end);

            winston.info("uploading......", fileName, " % ", (partNum / parts).toFixed(2));

            paramsData.push({
                Body: updatedBuffer,
                Bucket: bucketName,
                Key: folder + '/' + fileName,
                PartNumber: partNum + 1,
                UploadId: createMultipart.UploadId
            });
        }
        // console.log("================paramsData=============",paramsData)

        let etagData = paramsData.map(async params => {
            // return s3bucket.uploadPart(params).promise()
            let temp = await s3bucket.uploadPart(params).promise();
            return {ETag: temp.ETag, PartNumber: params.PartNumber};

        });
        console.log("============etagData===============", etagData);

        let dataPacks = await Promise.all(etagData);
        console.log("============etagData===============", dataPacks);

        return s3bucket.completeMultipartUpload({
            Bucket: bucketName,
            Key: folder + '/' + fileName,
            MultipartUpload: {
                Parts: dataPacks
            },
            UploadId: createMultipart.UploadId
        }).promise();
    } catch (err) {
        return err;
    }
}


async function uploadOriginalImage(fileBuffer, originalPicFolder, fileName, mimeType, videoOriginalFolder, videoThumbnailFolder, disposition) {
    if (fileBuffer.length > 5242880) {

        console.log("======mimeType=============", mimeType);
        return await uploadMultipart(fileBuffer, originalPicFolder, fileName, mimeType, fileBuffer.length, disposition);

        // return {};
    } else {
        await s3PutObject(originalPicFolder, fileName, fileBuffer, mimeType, disposition);
        return {};
    }
}

async function uploadThumbnailVideo(fileBuffer, originalPicFolder, fileName, mimeType, fileExtension, thumbnailName) {
    console.log("thumbNamethumbNamethumbNamethumbName", thumbnailName);

    try {
        console.log(" uploadThumbnailVideo ");
        let newPath = Path.join(__dirname, '../', '/uploads/', fileName);
        console.log(newPath, " newPath ");
        let fileUpload = await writedirAsync(newPath, fileBuffer);
        let thumbName = thumbnailName;
        console.log(" fileUpload ", thumbName);
        let thumbnailPicFolder = Path.join(__dirname, '../', '/uploads/');
        console.log("thumbnailPicFolderthumbnailPicFolderthumbnailPicFolder", thumbnailPicFolder);

        var process = new ffmpeg(newPath);
        process.then(async function (video) {
            // Callback mode
            video.fnExtractFrameToJPG(thumbnailPicFolder, {
                number: 1,
                file_name: thumbName + ".jpg"
            }, async function (error, file) {
                if (!error) {
                    console.log('New video file: ' + file);
                    console.log("thumbnailPicFolder", thumbnailPicFolder);
                    let bufferData = await readdirAsync(thumbnailPicFolder + thumbName + '_1.jpg');
                    console.log(bufferData, " bufferData ");
                    await uploadOriginalImage(bufferData, originalPicFolder, thumbName + ".jpg", 'image/jpg');
                    // await deleteFile(thumbnailPicFolder +thumbName+'_1.jpg');
                    // await deleteFile(newPath);
                    console.log(originalPicFolder, thumbName, "originalPicFolder - thumbnailFolder");
                } else {
                    throw error;
                }
            });
        }, function (err) {
            console.log('Error: ' + err);
            throw err;
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
        throw e;
    }
}


const writedirAsync = (path, data) => {
    return new Promise(function (resolve, reject) {
        Fs.writeFile(path, data, function (error) {
            if (error) {
                console.log("===error=========", error);
                reject(error);
            } else {
                console.log("===Successss=========");
                resolve();
            }
        });
    });
};

function readdirAsync(path, data) {
    return new Promise(function (resolve, reject) {
        Fs.readFile(path, (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
}



let getBuffer = async function (fileName, extension) {
    let contentType = "image/jpeg";
    if(extension === "pdf"){
        contentType = "application/pdf"
    }
    else if(extension === "doc"){
        contentType = "application/msword"
    }
    else if(extension === "docx"){
        contentType = "application/vnd.openxmlformats officedocument.wordprocessingml.document"
    }
    else{
        contentType = `image/${extension}`;
    }
    return new Promise(function (resolve, reject) {
        request({
            method: 'GET',
            url: fileName,
            encoding: null,
            headers: {
                'content-type': contentType,
            }
        }, (error, response, body) => {
            if (error) reject(error)
            else {
                resolve(Buffer.from(body).toString('base64'))
            }
        })
    })
}


module.exports = {
    uploadFile: uploadFile, 
    uploadFileOnS3BucketAfterRead:uploadFileOnS3BucketAfterRead,
    getBuffer: getBuffer
};
