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

    let checkCategory = event => {
        return (event.owner ? event.owner.category ? event.owner.category : null : null);
    };

    try {
        data.forEach(item => {
            temp = {};
            temp.eventPicture = (item.cover ? item.cover.source : null);
            temp.eventId = (item.id ? item.id : null);
            temp.eventName = (item.name ? item.name : null);
            temp.eventDescription = (item.description ? item.description : null);
            temp.eventCategory = checkCategory(item);
            temp.eventStartTime = (item.start_time ? item.start_time : null);
            temp.eventEndTime = (item.end_time ? item.end_time : null);
            temp.eventLocation = (item.place ? item.place : null);
            result.push(temp);
        });
    } catch (error) {
        errorOptions = {
            type: 'Server Error',
            code: 500,
            message: 'Internal Server Error',
            detail: 'Error in data structure: '.concat(error.message)
        };
        log.error(ApplicationError(errorOptions));
        log.error(error.message);
        throw ApplicationError(errorOptions);
    }

    return result;
};

module.exports = {
    beautifyResponse
};
