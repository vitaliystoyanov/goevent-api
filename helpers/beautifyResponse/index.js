const log = require('libs/log').getLogger(module);
const ApplicationError = require('helpers/applicationError').createApplicationError;

/**
 * Function change the form of data
 * @param {Object[]} data Data that beautify
 * @returns {Array} The modified form of the data
 */
let beautifyResponse = data => {
    let result = [];
    let errorOptions = {};
    let temp;

    try {
        data.forEach(item => {
            temp = {};
            temp.eventPicture = (item.cover ? item.cover.source : null);
            temp.eventId = (item.id ? item.id : null);
            temp.eventName = (item.name ? item.name : null);
            temp.eventDescription = (item.description ? item.description : null);
            temp.eventStartTime = (item.start_time ? item.start_time : null);
            temp.eventEndTime = (item.end_time ? item.end_time : null);
            temp.eventLocation = (item.place ? item.place : null);
            result.push(temp);
        });
    } catch (error) {
        errorOptions = {
            type: 'Application error',
            code: 500,
            message: 'Error in processing of data',
            detail: 'Error in data structure: '.concat(error.message)
        };
        log.error(ApplicationError(errorOptions));
        throw ApplicationError(errorOptions);
    }

    return result;
};

module.exports = {
    beautifyResponse
};
