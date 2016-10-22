const util = require('util');
const ApplicationError = require('helpers/applicationError').createApplicationError();

/**
 * Function checks the data for duplicates
 * @param {Array} duplicates Data with probalby duplicates
 * @returns {Array} result Array without duplicates
 */
const uniqueEvents = duplicates => {
    let obj = {};
    let result = [];
    let errorOptions = {};

    if (util.isArray(duplicates)) {
        duplicates.forEach(item => {
            let prop = item.eventId;
            obj[prop] = item;
        });
        for (let prop in obj) {
            result.push(obj[prop]);
        }

        return result;
    } else {
        errorOptions = {
            type: "Server Error",
            code: 500,
            message: "Internal Server Error",
            detail: "The argument duplicates is required but wasn't a valid type, must be Array.",
        };
        throw(ApplicationError(errorOptions));
    }
};

module.exports = {
    uniqueEvents
};
