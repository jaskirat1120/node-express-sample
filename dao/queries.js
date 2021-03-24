'use strict';

let saveData = (model, data) => {
    return model.create(data)
};

let getData = (model, data) => {
    return model.findAll(data);
};

let findOne = (model, data) => {
    return model.findOne(data);
};

let update = (model, conditions, update, options) => {
    return model.findOneAndUpdate(conditions, update, options);
};

let remove = (model, conditions, update, options, collectionOptions) => {
    return model.findOneAndUpdate(conditions, update, options).populate(collectionOptions).exec();
};

module.exports = {
    saveData,
    getData,
    findOne,
    update,
    remove
};