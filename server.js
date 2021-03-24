require("dotenv").config()
// import dotenv from "dotenv"
// dotenv.config()
const createError = require("http-errors");
// import createError from "http-errors";
const express = require("express");
const i18n = require("i18n");// Language
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
// require('./db-connection');
const http = require('http');
const helmet = require('helmet');
const swaggerJSDoc = require("swagger-jsdoc");
const bodyParser = require('body-parser');
const expressValidator = require("express-validator");
const expressWinston = require('express-winston');
const winston = require('winston');
const app = express();
const crypto = require('crypto');
// const models = require('./models')
algorithm = process.env.ALGO,
crypto_password = process.env.PWD;

//////////////  Global Parameters   //////////////////////////
global.appRoot = path.resolve(__dirname);

app.use(helmet());

//  Images  Upload  
var multer = require('multer');
const storage = multer.memoryStorage({

  destination: function (req, file, cb) {

    cb(null, appRoot + "/public/images")

  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})
global.upload = multer({ storage: storage })

const storageDisk = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appRoot + "/public/images")
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})
global.uploadDisk = multer({ storage: storageDisk })
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use('/', require('./api/routes/index'))
app.use('/common', require('./api/routes/common'))
//  Internationalization Added    
i18n.configure({

  lng: "en",
  defaultLocale: "en",
  directory: __dirname + "/locales",
  register: global,
  locales: ["en"],
  preload: ["en"],
  fallbackLng: "en",
  saveMissing: false,
  sendMissingTo: "en",
  useCookie: false,
  detectLngFromHeaders: false,
  syncFiles: false,
  api: {
    "__": "trans",  //now req.__ becomes req.t
    "__n": "tn" //and req.__n can be called as req.tn
  }

});
// Internationalization Added    

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json({ type: 'application/json' }));
// app.use(expressValidator()); // Add this after the bodyParser middleware!
app.use(i18n.init);

//   Logger    
app.use(expressWinston.logger({
  transports: [

    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),

  ],
  requestWhitelist:['query','body'],
}));

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}));

var options = {
  swaggerDefinition: {
    info: {
      title: process.env.APP_NAME ? process.env.APP_NAME : "Backend", // Title (required)
      version: "1.0.0", // Version (required)
    },
    securityDefinitions: {
      secretdbkey: {
        type: "apiKey",
        in: "headers",
        name: "jwt"
      },
    },
    "security": [
      {
         "jwt":[],
        //  "languageId": []
      }
    ],

  },
  apis: [
    // "./routes/index.js",
  ], // Path to the API docs
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
var swaggerSpec = swaggerJSDoc(options);

if (process.env.NODE_ENV == 'development') {
  app.get("/api-docs.json", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log('err', err);
  // set locals, only providing error in devexpressdevelopment" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

var server = http.createServer(app).listen(process.env.PORT, function () {
  console.log(`Express server listening on port ${process.env.PORT}`);
});


module.exports = app;
