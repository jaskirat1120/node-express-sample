require('dotenv').config();

const responseMessages = require('../config/constants/response-messages');
const appDefaults = require('../config/constants/app-defaults');
const db = require('../models');

const validateApiAccessToken = function (req, res, next) {
    try {
        let language = req.headers && req.headers.language ? req.headers.language : appDefaults.DATABASE.LANGUAGES.EN
        if (req.headers.authorization && req.headers.authorization != undefined) {
            let tokenData = req.headers.authorization.split(' ');

            if (tokenData[0] != 'Bearer') {
                return next(responseMessages.STATUS_MSG.ERROR.INVALID_TOKEN_TYPE[language]);
            } else if (!tokenData[1]) {
                return next(responseMessages.STATUS_MSG.ERROR.UNAUTHORIZED[language]);
            } else {
                verifyAccessToken(tokenData[1])
                    .then(d => {
                        req.body.userData = d;
                        req.body.accessToken = tokenData[1];
                        next();
                    })
                    .catch(err => {
                        next(err);
                    });
            }
        } else {
            return next(responseMessages.STATUS_MSG.ERROR.TOKEN_REQUIRED[language]);
        }
    } catch (err) {
        return Promise.reject(err);
    }
};


const verifyAccessToken = async(accessToken) => {
    try {
        return {};
    } catch (err) {
      return Promise.reject(responseMessages.STATUS_MSG.ERROR.SOMETHING_WENT_WRONG);
    }
};

module.exports = {
    validateApiAccessToken: validateApiAccessToken
} 

