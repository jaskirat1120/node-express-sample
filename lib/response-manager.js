// constructor
const Boom = require('boom');

// constants imported
const constants = require('../config/constants');
const responseMessages = constants.responseMessages;

// local modules
const LogManager = require('./log-manager');

const sendError = function (language, data, request, response) {
	if (request) {
		request.i18n.setLocale(language)
	}
	language = language ? language : "en";
	console.log("language,data", language, data)
	if (typeof data == 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('message')) {
		console.log('attaching resposnetype', data);
		let msg = data.message[language || 'en'];
		msg = msg.replace(msg.charAt(0), msg.charAt(0).toUpperCase());
		let errorToSend = Boom.create(data.statusCode, msg);
		if (request) {
			errorToSend = Boom.create(data.statusCode, request.i18n.t(data.type));
			console.log("errorToSend Traslated", errorToSend)
		}
		errorToSend.output.payload.responseType = data.type;
		console.log('after resposnetype', errorToSend);
		return errorToSend;
	} else {
		let errorToSend = '';
		if (typeof data == 'object') {
			if (data.name == 'ApplicationError') {
				errorToSend += responseMessages.STATUS_MSG.ERROR.APP_ERROR.message[language || 'en'] + ' : ';
			} else if (data.name == 'ValidationError') {
				errorToSend += responseMessages.STATUS_MSG.ERROR.APP_ERROR.message[language || 'en'] + data.message;
			}
			else if (data.name == 'ValidatorError') {
				errorToSend += responseMessages.STATUS_MSG.ERROR.APP_ERROR.message[language || 'en'] + data.message;
			} else if (data.name === "RuntimeError") {
				let msg = data.message.split('/');
				errorToSend += msg[msg.length - 1];
			}
		} else {
			errorToSend = data;

		}
		let customErrorMessage = errorToSend;
		if (typeof customErrorMessage == 'string') {
			if (errorToSend.indexOf("[") > -1) {
				customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
			}
			customErrorMessage = customErrorMessage && customErrorMessage.replace(/"/g, '');
			customErrorMessage = customErrorMessage && customErrorMessage.replace('[', '');
			customErrorMessage = customErrorMessage && customErrorMessage.replace(']', '');

			customErrorMessage = customErrorMessage.replace(customErrorMessage.charAt(0), customErrorMessage.charAt(0).toUpperCase());
		}

		if (request) {
			return Boom.create(400, request.i18n.t(customErrorMessage));
		}
		else {
			return Boom.create(400, customErrorMessage);
		}
	}
};

const sendSuccess = function (request, response, language, successMsg, data) {
	successMsg = successMsg || responseMessages.STATUS_MSG.SUCCESS.DEFAULT.message;
	if (typeof successMsg == 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('message')) {
		return {
			meta: {
				type: 'success',
				statusCode: successMsg.statusCode,
				message: successMsg.message[language || 'en']
			},
			data: data || {}
		};

	} else {
		return {
			meta: {
				type: 'success',
				statusCode: 200,
				message: successMsg
			},
			data: {
				data: data || {}
			}
		};
	}
};

const wrapError = (sourceFile) => {
	return (request, language, sourceMethod, error, userPostedData) => {
		try {
			// LogManager.logResponeError(sourceFile, sourceMethod, error, userPostedData);
			return sendError(language, error, request);
		} catch (err) {
			LogManager.logger.error(err);
		}
	};
};

module.exports = {
	sendError: sendError,
	sendSuccess: sendSuccess,
	wrapError: wrapError
};