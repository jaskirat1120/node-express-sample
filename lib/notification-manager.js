'use strict';


const FCM = require('fcm-node');
const Config = require('../config');
const Dao = require('../dao/queries');
const APP_CONSTANTS = require('../config/constants').appDefaults;
const serverKeyUser = process.env.FCM_SERVER_KEY_USER;
// const fcmAdmin = new FCM(serverKeyAdmin);
const fcmUser = new FCM(serverKeyUser);


let sendPush = function (deviceToken, data, type) {
    console.log("***data******", data, deviceToken);
    return new Promise((resolve, reject) => {
        let message = {
            to: deviceToken,
            notification: {
                title: data.title,
                body: data.message,
                sound: "default",
                badge: 0,
                show_in_foreground: true
            },
            data: data,
            priority: 'high',
            show_in_foreground: true
        };
        if (type === APP_CONSTANTS.USER_TYPE.USER) {
            fcmUser.send(message, function (err, result) {
                if (err) {
                    console.log("Something has gone wrong! in User Notification", err);
                    resolve(null);
                } else {
                    console.log("Successfully sent to User with response: ", result);
                    resolve(null, result);
                }
            });
        } else {
            fcmUser.send(message, function (err, result) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                    resolve(null);
                } else {
                    console.log("Successfully sent with response: ", result);
                    resolve(null, result);
                }
            });
        }
    });
};


let sendNotifications = async (notificationData, save) => {
    // if(save) then save notification in db
    await sendPush(notificationData.deviceToken, notificationData.sendPushData, notificationData.type);
    console.log("NOTIFICATION RESPPONSE")
    return {};
};

let testNotification = async () => {
    try {
        let data = {
                title: 'Test',
                message: 'Test'
            },
            deviceToken = "";
        await sendPush(deviceToken, data, type);
    } catch (e) {
        throw e;
    }
};


module.exports = {
    sendPush: sendPush,
    sendNotifications: sendNotifications
};
