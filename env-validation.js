// npm modules
require('dotenv').config();
const joi = require('joi');

const envVarsSchema = joi.object({
    NODE_ENV: joi.string()
        .allow(['dev', 'production', 'test', 'local'])
        .required(),
    PORT: joi.number()
        .required(),

    // jwt
    JWT_SECRET: joi.string()
        .required().min(8),
    DB_USER_NAME: joi.string()
        .required(),
    DB_USER_PASSWORD: joi.string()
        .required(),
    DB_HOST: joi.string()
        .required(),
    DB_NAME: joi.string()
        .required(),

    // ses
    SES_ACCESS_KEY_ID: joi.string()
        .required(),
    SES_SECRET_ACCESS_KEY: joi.string()
        .required(),

    // logger
    LOG_CRIT_ERR_TO_DB: joi.boolean()
        .truthy('TRUE')
        .truthy('true')
        .falsy('FALSE')
        .falsy('false')
        .default(true),

    // fcm
    FCM_SERVER_KEY_USER: joi.string()
        .required(),
    // fcm
    FCM_SERVER_KEY_DRIVER: joi.string()
        .required(),

    // s3 bucket
    BUCKET_NAME: joi.string()
        .required(),
    BUCKET_ACCESS_KEY_ID: joi.string()
        .required(),
    BUCKET_SECRET_ACCESS_KEY: joi.string()
        .required(),
    BUCKET_S3_URL: joi.string()
        .required(),
    BUCKET_REGION: joi.string()
        .required()
}).unknown()
    .required();


const {error, value: envVars} = joi.validate(process.env, envVarsSchema);
if (error) {
    throw new Error(`Enviorment validation error: ${error.message}`);
}
