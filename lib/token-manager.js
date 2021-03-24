
const jwt = require('jsonwebtoken');
// const db = require('../models');
const responseMessages = require('../config/constants/response-messages');

const generateToken = (tokenData) => {
    return jwt.sign(tokenData, process.env.JWT_SECRET);
};

const verifyToken = async function (req, next) {
    try {
        if ((!!req.query && !!req.query.token) || (!!req.params && !!req.params.token)) {
            let token = (!!req.query && !!req.query.token && req.query.token) || req.params.token;
            let decoded = await jwt.verify(token, process.env.JWT_SECRET);
            next();
        }
    } catch (err) {
        if (!!err.name && err.name === 'JsonWebTokenError') {
            next(responseMessages.STATUS_MSG.ERROR.INVALID_TOKEN);
        } else {
            return next(err);
        }
    }
};

module.exports = {
    generateToken,
    verifyToken
};