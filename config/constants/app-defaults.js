require('dotenv').config();

module.exports = {
    APP: {
        NAME: 'Ticketing',
        BACKGROUND: '#000',
        DEFAULT_CURRENCY: "$"
    },
    SERVER: {
        HOST: 'localhost',
        PORT: 8000,
        CRON_PORT: 8002
    },
    API: {
        VERSIONS: {
            v1: 'v1',
            v2: 'v2'
        },
        ROUTES: {
            QR: "qr"
        }
    },
    SCHEMA_ENUMS: {
        USER: {
            SIGNUP_TYPE: {
                PHONE_NUMBER: 'PHONE_NUMBER',
                EMAIL: 'EMAIL'
            }
        },
        IMAGE: {
            IMAGE_TYPE: {
                IMAGE: 'IMAGE',
                VIDEO: 'VIDEO'
            }
        }
    },
    STATUS_ENUM: {
        ACTIVE: "ACTIVE",
        ALL: "ALL",
        PENDING: "PENDING",
        BLOCKED: "BLOCKED",
        DELETED: "DELETED",
        APPROVED: "APPROVED",
        REGISTRATION: "REGISTRATION",
        ONBOARDING: "ONBOARDING",
        EDITED: "EDITED",
        INACTIVE: "INACTIVE",
        FOLLOW: "FOLLOW",
        UNFOLLOW: "UNFOLLOW",
        LIKE: "LIKE",
        UNLIKE: "UNLIKE",
    },
    VOUCHER_TYPE:{
        PERCENTAGE: "PERCENTAGE",
        FLAT: "FLAT"
    },
    DOCUMENT_TYPE: {
        LICENSE: "LICENSE",
        VEHICLE_IMAGES: "VEHICLE_IMAGES",
        DOCUMENTS: "DOCUMENTS"
    },
    IMAGE_TYPE: {
        FRONT: "FRONT",
        BACK: "BACK",
        RIGHT: "RIGHT",
        LEFT: "LEFT"
    },
    GRAPH_TYPE: {
        YEARLY: "YEARLY",
        DAILY: "DAILY",
        WEEKLY: "WEEKLY",
        MONTHLY: "MONTHLY",
    },
    MEDIA_TYPE_ENUM: {
        IMAGE: "IMAGE",
        VIDEO: "VIDEO",
        AUDIO: "AUDIO",
        FILE: "FILE"
    },
    DEVICE_TYPE_ENUM: {
        IOS: "IOS",
        WEB: "WEB",
        ANDROID: "ANDROID"
    },
    JWT_SECRET: {
        USER: process.env.JWT_SECRET_USER,
        STORE: process.env.JWT_SECRET_STORE,
        ADMIN: process.env.JWT_SECRET_ADMIN
    },
    BUCKET: {
        FOLDER: {
            "imageOriginal": "imageOriginal",
            "imageThumb": "imageThumb",
            "imageProcessed": "imageProcessed",
            "imageThumbnailMed": "imageThumbnailMed",
            "videoOriginal": "videoOriginal",
            "audioOriginal": "audioOriginal",
            "videoThumb": "videoThumb",
            "documentOriginal": "documentOriginal",
            "earningReports": "earningReports"
        }
    },
    AUTH_STRATEGIES: {
        USER: 'USER'
    },
    USER_TYPE: {
        USER: 'USER'
    },
    CONTACT_US_TYPE:{
        SUPPORT: "SUPPORT",
        CONTACT_US: "CONTACT_US"
    },
    VERIFICATION_TYPE: {
        EMAIL: 1,
        PHONE: 2
    },
    DATABASE: {
        DOC_STATUSES: {
            BLOCKED: 'BLOCKED',
            DELETED: 'DELETED',
            UNBLOCKED: 'UNBLOCKED'
        },
        MODELS_NAME: {
            ADMIN: 'Admins',
        },
        NOTIFICATION_TYPE: {},
        NOTIFICATION_STATUS: {
            READ: 'READ',
            UNREAD: 'UNREAD',
            CLEAR: 'CLEAR',
            DELETED: 'DELETED'
        },
        NOTIFICATION_TITLE: {},
        NOTIFICATION_MESSAGE: {},
        GRAPH_TYPE: {
            WEEKLY: 'WEEKLY',
            MONTHLY: 'MONTHLY',
            YEARLY: 'YEARLY'
        },
        DEVICE_TYPES: {
            ANDROID: 'ANDROID',
            IOS: 'IOS',
            WEB: 'WEB'
        },
        LANGUAGES: {
            EN: 'en',
            PT: 'pt'
        },
        FILE_PREFIX: {
            ORIGINAL: 'original_',
            OBJECT: 'object_',
            THUMB: 'thumb_',
            VIDEO: 'video_',
            PACKAGE: 'package_',
            FILTER: 'filter_',
            LENSE: 'lense_',
            LOGO: 'logo_',
            BACKGROUND: 'background_',
            OBJECT_ORIGINAL: 'triggerImage_',
            PROFILE: 'profile_',
            CHAT: 'chat_',
        },
        LOGO_PREFIX: {
            ORIGINAL: 'logo_',
            THUMB: 'logoThumb_'
        },
        FILE_TYPES: {
            LOGO: 'LOGO',
            DOCUMENT: 'DOCUMENT',
            OTHERS: 'OTHERS',
            IMAGE: 'IMAGE',
            VIDEO: 'VIDEO',
            OBJECT: 'OBJECT',
            OTHER_FILE: 'OTHER_FILE',
        },
        UPLOAD_TYPES: {
            GALLERY: 'GALLERY',
            LOGO: 'LOGO',
            PROFILE: 'PROFILE',
            CHAT: 'CHAT'
        },
        DOCUMENT_PREFIX: 'document_'
    },
    DB_LOGGER_TYPES: {
        ERROR: {
            CLIENT: 'CLIENT',
            SERVER: 'SERVER',
            THIRD_PARTY: 'THIRD PARTY'
        },
        LOGGER: {
            REQUEST: 'REQUEST',
            RESPONSE: 'RESPONSE',
            CRON: 'CRON',
            BACKEND_PROCESS: 'BACKEND PROCESS'
        }
    }
};
