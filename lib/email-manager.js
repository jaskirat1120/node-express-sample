const config = require('../config');
const nodemailer = require("nodemailer");
let aws = require('../config/email-conf');
let sesTransport = require('nodemailer-ses-transport');
let awsSDK = require('aws-sdk');
let s3 = new awsSDK.S3();

exports.sendEmailSMTP=async function(email, subject, content){
    // create reusable transporter object using the default SMTP transport
    try{
        let transporter = nodemailer.createTransport({
            // host: "smtp.ethereal.email",
            service: "Gmail",
            // port: 587,
            // secure: false, // true for 465, false for other ports
            manager: {
                user: process.env.email, // generated ethereal user
                pass: process.env.password // generated ethereal password
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: process.env.email, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            // text: "Hello world?", // plain text body
            html: content // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    catch (e) {
        throw e
    }

}


exports.sendEmail = function(email, subject, content, attachment) {

    let transporter = nodemailer.createTransport(sesTransport({
        accessKeyId : aws.AWS_SES.accessKeyId,
        secretAccessKey: aws.AWS_SES.secretAccessKey,
        region:aws.AWS_SES.region
    }));

    let emailObj = {
        from: process.env.SES_EMAIL, // sender address
        bcc: email, // list of receivers
        subject: subject, // Subject line
        html: content
    }
    console.log("attachment", attachment)

    if(attachment){
        emailObj.attachments = [{  
            filename: 'Invoice.pdf',
            path: attachment // stream this file
        },]
    }
    console.log("emailObj", emailObj)

    return new Promise((resolve, reject) => {
        transporter.sendMail(emailObj,(err,res)=>{
            console.log('send mail',err,res);
            resolve()
        });
    })

};
