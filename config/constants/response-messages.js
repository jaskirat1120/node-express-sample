require('dotenv').config();

module.exports = {
    STATUS_MSG: {
        SUCCESS: {
            DEFAULT: {
                statusCode: 200,
                message: {
                    en : 'Success'
                },
                type: 'DEFAULT'
            },
            SUCCESS: {
                statusCode: 200,
                message: {
                    en : 'Success.'
                },
                type: 'SUCCESS'
            },
            CREATED: {
                statusCode: 200,
                message: {
                    en : 'Successfully created.'
                },
                type: 'CREATED'
            },
            SOCKET_CONNECTION: {
                statusCode: 200,
                message: {
                    en : 'Socket connected successfully'
                },
                type: 'SOCKET_CONNECTION'
            },
            DELETED: {
                statusCode: 200,
                message: {
                    en : 'Successfully deleted.'
                },
                type: 'DELETED'
            }
        },
        ERROR: {
            TOKEN_REQUIRED: {
                statusCode: 400,
                message: {
                    en : 'Authorization token is required.'
                },
                type: 'INVALID_TOKEN_TYPE'
            },
            INVALID_TOKEN_TYPE: {
                statusCode: 400,
                message: {
                    en : 'Token type must be of Bearer type.'
                },
                type: 'INVALID_TOKEN_TYPE'
            },
            INVALID_TOKEN: {
                statusCode: 401,
                message: {
                    en : 'Invalid token.'
                },
                type: 'INVALID_TOKEN'
            },
            UNAUTHORIZED: {
                statusCode: 401,
                message: {
                    en : 'Sorry, you are not authorized to perform this action.'
                },
                type: 'UNAUTHORIZED'
            },
            SOMETHING_WENT_WRONG: {
                statusCode: 500,
                message: {
                    en : 'Something went wrong on server.'
                },
                type: 'SOMETHING_WENT_WRONG'
            },
            DB_ERROR: {
                statusCode: 400,
                message: {
                    en : 'DB Error : '
                },
                type: 'DB_ERROR'
            },
            DUPLICATE: {
                statusCode: 400,
                message: {
                    en : 'Duplicate Entry'
                },
                type: 'DUPLICATE'
            }
        }
    }
};
