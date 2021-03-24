'use strict';

// npm modules
const joi = require('joi');
const md5 = require('md5');
const handlebars = require('handlebars');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const randomString = require("randomstring");
const CEP = require("cep-promise");
const CPF = require("cpf-cnpj-validator");
const json2csvParser = require('json2csv').Parser;

// constructor
const Boom = require('boom');

// local modules
const Logger = require('../lib/log-manager').logger;

// constants imported
const CONSTANTS = require('../config/constants');
const RESPONSE_MESSAGES = CONSTANTS.responseMessages;
const APP_CONSTANTS = CONSTANTS.appDefaults;


const customQueryDataValidations = function (type, key, data, callback) {
    let schema = {};
    switch (type) {
        case 'PHONE_NO':
            schema[key] = joi.string().regex(/^[0-9]+$/).length(10);
            break;
        case 'NAME':
            schema[key] = joi.string().regex(/^[a-zA-Z ]+$/).min(2);
            break;
        case 'BOOLEAN':
            schema[key] = joi.boolean();
            break;
    }
    let value = {};
    value[key] = data;

    schema.validate(value, schema, callback);
};


const authorizationHeaderObj = joi.object({
    authorization: joi.string().required().description('Send access Token adding "bearer " in front like "bearer accessToken"'),
    timezone: joi.string().optional().allow(""),
    language: joi.string().default(APP_CONSTANTS.DATABASE.LANGUAGES.EN).valid([APP_CONSTANTS.DATABASE.LANGUAGES.EN]).description("EN for English")
}).unknown();

const authorizationHeaderObjOptional = joi.object({
    authorization: joi.string().optional().description('Send access Token adding "bearer " in front like "bearer accessToken"'),
    timezone: joi.string().optional().allow(""),
    language: joi.string().default(APP_CONSTANTS.DATABASE.LANGUAGES.EN).valid([APP_CONSTANTS.DATABASE.LANGUAGES.EN]).description("EN for English")
}).unknown();

const languageHeaderObj = joi.object({
    language: joi.string().default(APP_CONSTANTS.DATABASE.LANGUAGES.EN).valid([APP_CONSTANTS.DATABASE.LANGUAGES.EN]).description("en for English"),
    timezone: joi.string().optional().allow(""),
}).unknown();

const CryptData = function (stringToCrypt) {
    return md5(md5(stringToCrypt));
};


const encryptDecrypt = async (text, type) => {
    let algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
    let key = 'password';
    console.log(text, type);
    if (type.toString() === 'encrypt') {
        let cipher = crypto.createCipher(algorithm, key);
        let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        return encrypted;
    } else if (type.toString() === 'decrypt') {
        let decipher = crypto.createDecipher(algorithm, key);
        let dec = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
        return dec;
    }
};


const hashPassword = function (plainTextPassword) {

    return md5(md5(plainTextPassword));

    //bcrypt.hash(plainTextPassword,saltRounds,function(err,hash){
    //  callback(err,hash);
};

const compareHashPassword = function (plainTextPassword, hash) {

    return md5(md5(plainTextPassword)) === hash;

    /*bcrypt.compare(plainTextPassword,hash,function(err,res){
       callback(err,res);
    })*/
};

const getFileNameWithUserId = function (thumbFlag, fullFileName, type, uploadType) {
    let prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.ORIGINAL;
    if (type === CONSTANTS.appDefaults.DATABASE.FILE_TYPES.VIDEO) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.VIDEO;
    }
    if (type === CONSTANTS.appDefaults.DATABASE.FILE_TYPES.DOCUMENT) {
        prefix = CONSTANTS.appDefaults.DATABASE.DOCUMENT_PREFIX;
    }
    if (type === CONSTANTS.appDefaults.DATABASE.FILE_TYPES.OBJECT) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.OBJECT;
    }
    if (type === CONSTANTS.appDefaults.DATABASE.FILE_TYPES.TEXTURE_IMAGE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.TEXTURE_IMAGE;
    }
    if (type === CONSTANTS.appDefaults.DATABASE.FILE_TYPES.MTL_FILE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.MTL_FILE;
    }


    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.OBJECT) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.OBJECT_ORIGINAL;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.GALLERY) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.ORIGINAL;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.PACKAGE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PACKAGE;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.BACKGROUND) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.BACKGROUND;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.LOGO) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.LOGO;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.FILTER) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.FILTER;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.LENSE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.LENSE;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.PROFILE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PROFILE;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.CHAT) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PROFILE;
    }
    let id = new Date().getTime() + Math.floor(Math.random() * 2920) + 1;
    let ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0);
    if (thumbFlag && type !== CONSTANTS.appDefaults.DATABASE.FILE_TYPES.TEXTURE_IMAGE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.THUMB;
    }
    console.log(prefix, 'prefix');
    return prefix + id + ext;
};

const getFileNameWithUserIdWithCustomPrefix = function (thumbFlag, fullFileName, type, userId) {
    let prefix = '';
    if (type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.LOGO) {
        prefix = CONSTANTS.appDefaults.DATABASE.LOGO_PREFIX.ORIGINAL;
    } else if (type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.DOCUMENT) {
        prefix = CONSTANTS.appDefaults.DATABASE.DOCUMENT_PREFIX;
    }
    let ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0, fullFileName.length);
    if (thumbFlag && type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.LOGO) {
        prefix = CONSTANTS.appDefaults.DATABASE.LOGO_PREFIX.THUMB;
    }
    return prefix + userId + ext;
};

const generateFilenameWithExtension = function (oldFilename, newFilename) {
    let ext = oldFilename.substr(oldFilename.lastIndexOf(".") + 1);
    return newFilename + new Date().getTime() + Math.floor(Math.random() * 2920) + 1 + '.' + ext;
};

const updateNotificationMsgText = function (msg, data) {
    msg = handlebars.compile(msg);
    return msg(data);
};

const updateNotificationMsgObject = function (msgObj, data) {
    let msg = handlebars.compile(msgObj.customMessage);
    msgObj.customMessage = msg(data);
    return msgObj;
};

const checkObjectId = function (ids) {
    const ObjectId = mongoose.Types.ObjectId;
    if (ids && ids.$in && typeof ids.$in == 'object' && ids.$in.length) {
        let length = ids.$in.length;
        for (let i = 0; i < length; i++) {
            if (!ObjectId.isValid(ids.$in[i])) {
                return false;
            }
        }
        return true;
    } else {
        return ObjectId.isValid(ids);
    }
};

/*
* @function - deleteExtraObjKeys - This method will remove extra keys from object
*
* @params {Object} obj - This will be object on which delete keys operation will be performaed
* @params {String[]} - This will be array of keys to remove from the object
*
* @return {Object} - The new object with deleted keys
* */
const deleteObjKeys = (obj, keysToRemove) => {
    if (typeof keysToRemove !== 'object' || !keysToRemove.length) {
        throw '"keysToRemove" parameter must be of type array.';
    }
    let newObj = Object.assign({}, obj);
    for (let i = 0; i < keysToRemove.length; i++) {
        delete newObj[keysToRemove[i]];
    }

    return newObj;
};

function removeDiacriticCharacters(phrase) {
    const strAccents = phrase.split('');
    let strAccentsOut = [];
    let strAccentsLen = strAccents.length;
    let accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    let accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    for (let i = 0; i < strAccentsLen; i++) {
        if (accents.indexOf(strAccents[i]) != -1) {
            strAccentsOut[i] = accentsOut.substr(accents.indexOf(strAccents[i]), 1);
        } else {
            strAccentsOut[i] = strAccents[i];
        }
    }
    strAccentsOut = strAccentsOut.join('');
    return strAccentsOut;
}


const escapeRegex = (str) => {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

let bCryptData = async function (data) {             // bcryptjs encryption
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(data, salt).then(result => {
                resolve(result);
            });
        });
    });
};

let compareCryptData = function (data, hash) {       // bcryptjs matching
    return new Promise((resolve, reject) => {
        bcrypt.compare(data, hash).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
};

const generateRandomString = function () {
    return randomString.generate(10);
};

const generateRandomOTP = function () {
    return randomString.generate({
        length: 6,
        charset: 'numeric'
    });
};


const generateRandom = function (length) {
    return randomString.generate({
        length: length?length:2,
        charset: 'numeric'
    });
};

function renderMessageFromTemplateAndVariables(templateData, variablesData) {
    return handlebars.compile(templateData)(variablesData);
}

async function renderMessageAccordingToLanguage(object, dataToRender) {
    let objToReturn = {}
    for (let lang in APP_CONSTANTS.DATABASE.LANGUAGES) {
        if (object[APP_CONSTANTS.DATABASE.LANGUAGES[lang]]) {
            let msg = renderMessageFromTemplateAndVariables(object[APP_CONSTANTS.DATABASE.LANGUAGES[lang]], dataToRender);
            objToReturn[APP_CONSTANTS.DATABASE.LANGUAGES[lang]] = msg
        }
    }
    return objToReturn
}

let mediaAuthRequired = joi.object().keys({
    original: joi.string().required(),
    thumbnail: joi.string().required(),
    fileName: joi.string(),
    type: joi.string(),
    thumbnailMed: joi.string(),
    _id: joi.string().optional().allow('')
}).unknown().required();

let mediaAuth = joi.object().keys({
    original: joi.string().optional().allow(''),
    thumbnail: joi.string().optional().allow(''),
    fileName: joi.string().optional().allow(''),
    type: joi.string().optional().allow(''),
    thumbnailMed: joi.string().optional().allow(''),
    processed: joi.string().optional().allow(''),
    _id: joi.string().optional().allow('')
});

let internalServerError = joi.object().keys({
    "statusCode": joi.number().example(500),
    "error": joi.string().example("Internal Server Error"),
    "message": joi.string().example("An internal server error occurred")
}).label("INTERNAL_SERVER_ERROR");

let unAuthorized = joi.object().keys({
    "statusCode": joi.number().example(401),
    "error": joi.string().example("Unauthorized"),
    "message": joi.string().example("Invalid token"),
    "attributes": joi.object().keys({
      "error": joi.string().example("Invalid token")
    })
}).label("UNAUTHORIZED");


let badRequest = joi.object().keys({
    "statusCode": joi.number().example(400),
    "error": joi.string().example("Bad Request"),
    "message": joi.string().example("Please enter valid credentials."),
    responseType: joi.string().example("INVALID_EMAIL"),
}).label("BAD_REQUEST");

let metaData = joi.object().keys({
    "statusCode": joi.number().example(200),
    "type": joi.string().example("success"),
    "message": joi.string().example("Success"),
}).label("META_DATA");


let mediaAuthPdf = joi.object().keys({
    original: joi.string().optional().allow(''),
    thumbnail: joi.string().optional().allow(''),
    type: joi.string().optional().allow(''),
    fileName: joi.string().optional().allow(''),
    _id: joi.string().optional().allow(''),
    size: joi.number().optional().allow(''),
    createdAt: joi.date().optional(),
    thumbnailMed: joi.string().optional().allow(''),
    processed: joi.string().optional().allow(''),
});

let mediaSchema = {
    original: {type: String, default: ""},
    thumbnail: {type: String, default: ""},
    processed: {type: String, default: ""},
    thumbnailMed: {type: String, default: ""},
    fileName: {type: String, default: ""},
    type: {type: String, default: ""} // media format
};

let mediaSchemaPdf = {
    original: {type: String, default: ""},
    fileName: {type: String, default: ""},
    type: {type: String, default: ""} // media format
};

const createCSV = async (dataToParse, fields)=>{
    try{
        const json = new json2csvParser({fields});
        let csv = await json.parse(dataToParse);
        return csv;
    }catch(e){
        throw e
    }
}

module.exports = {
    CryptData: CryptData,
    getFileNameWithUserId: getFileNameWithUserId,
    getFileNameWithUserIdWithCustomPrefix: getFileNameWithUserIdWithCustomPrefix,
    customQueryDataValidations: customQueryDataValidations,
    hashPassword: hashPassword,
    compareHashPassword: compareHashPassword,
    updateNotificationMsgText: updateNotificationMsgText,
    updateNotificationMsgObject: updateNotificationMsgObject,
    authorizationHeaderObj: authorizationHeaderObj,
    authorizationHeaderObjOptional: authorizationHeaderObjOptional,
    generateFilenameWithExtension: generateFilenameWithExtension,
    checkObjectId: checkObjectId,
    removeDiacriticCharacters: removeDiacriticCharacters,
    deleteObjKeys: deleteObjKeys,
    escapeRegex: escapeRegex,
    bCryptData: bCryptData,
    compareCryptData: compareCryptData,
    mediaAuthRequired: mediaAuthRequired,
    mediaAuth: mediaAuth,
    mediaAuthPdf: mediaAuthPdf,
    mediaSchema: mediaSchema,
    mediaSchemaPdf: mediaSchemaPdf,
    generateRandomString: generateRandomString,
    languageHeaderObj: languageHeaderObj,
    encryptDecrypt: encryptDecrypt,
    generateRandomOTP: generateRandomOTP,
    renderMessageFromTemplateAndVariables: renderMessageFromTemplateAndVariables,
    renderMessageAccordingToLanguage: renderMessageAccordingToLanguage,
    generateRandom: generateRandom,
    internalServerError: internalServerError,
    unAuthorized: unAuthorized,
    badRequest: badRequest,
    createCSV: createCSV,
    metaData: metaData
};
