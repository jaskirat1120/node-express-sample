"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var basename = path.basename(__filename);
var db = {};
	
var dbConfig = {
	"host": process.env.DB_HOST,
	"dialect": "mysql",
	"port": process.env.DB_PORT,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: true,
    logging: false,
	dialectOptions: {
    	useUTC: true, //for reading from database
    	dateStrings: true,

	    typeCast: function (field, next) { // for reading from database
	        if (field.type === "DATETIME") {
	        	return field.string();
	        }
	        return next();
	    },
	},
	timezone: "+00:00"


};

var sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, dbConfig);

fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
	})
	.forEach(file => {
		var model = sequelize["import"](path.join(__dirname, file));
		db[model.name] = model;
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Sequelize.Op

module.exports = db;
