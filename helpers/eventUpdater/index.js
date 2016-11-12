const schedule = require('node-schedule');
const searchEvents = require('libs/facebook/search');
const Event = require('models/Event').Event;
const ApplicationError = require('helpers/applicationError').createApplicationError;
const log = require('libs/log').getLogger(module);
const uniqueEvents = require('helpers/uniqueEvents').uniqueEvents;

// date of permanent updating of the database
const DATE_SCHEDULE = {
    hour: 14,
    minute: 43,
    dayOfWeek: 6
};

/**
 * Save all events from data in database
 * @param {Array} data Array of events which need to save in database
 */
const createEvent = data => {
    let event;
    let errorOptions = {};

    data.forEach(item => {
        event = new Event({
            eventPicture: item.eventPicture,
            eventId: item.eventId,
            eventName: item.eventName,
            eventDescription: item.eventDescription,
            eventCategory: item.eventCategory,
            eventStartTime: item.eventStartTime,
            eventEndTime: item.eventEndTime,
            eventLocation: item.eventLocation
        });

        event.save(error => {
            if (error) {
                log.error(error);
                errorOptions = {
                    type: "Server Error",
                    code: 500,
                    message: "Internal Server Error",
                    detail: "An error occurred while trying to save a record",
                };
                throw(ApplicationError(errorOptions));
            } else {
                log.info('Successfuly saved new record');
            }
        });
    });
};

/**
 * Delete all records from database
 */
const deleteAllEvents = () => {
    Event.remove({}, (error) => {
        if (error) {
            log.error(error);
            errorOptions = {
                type: "Server Error",
                code: 500,
                message: "Internal Server Error",
                detail: "An error in an attempt to delete all records",
            };
            throw(ApplicationError(errorOptions));
        } else {
            log.info('Successfully deleted all records');
        }
    });
};

/**
 * Makes database updates every week at Time[XX(hourse):XX(minutes)] and [day of week]
 */
let updater = schedule.scheduleJob(DATE_SCHEDULE, () => {
    let searchResponse = {};

    log.info('updater works...');

    searchEvents()
        .then(response => {

            // check that all the events were unique
            searchResponse.events = uniqueEvents(response);
            searchResponse.count = searchResponse.events.length;

            return searchResponse;
        })
        .then(searchResponse => {

            // clear database from old events
            deleteAllEvents();

            return searchResponse;
        })
        .then(searchResponse => {

            // saving new events in database
            createEvent(searchResponse.events);
        })
        .catch(error => {
            log.error(error);

            // res.status(error.code).json(error);
        });
});

module.exports = {
    updater
};
