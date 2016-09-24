const schedule = require('node-schedule');
const searchEvents = require('routes/facebook/search');
const Event = require('models/Event');
const ApplicationError = require('helpers/applicationError').createApplicationError;
const log = require('libs/log').getLogger(module);
const uniqueEvents = require('helpers/uniqueEvents').uniqueEvents;

// Date of permanent updating of the database
const DATE_SCHEDULE = {
    hour: 12,
    minute: 0,
    dayOfWeek: 2
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
            eventStartTime: item.eventStartTime,
            eventEndTime: item.eventEndTime,
            eventLocation: item.eventLocation
        });

        event.save(error => {
            if (error) {
                log.error(error);
                errorOptions = {
                    type: "Application save event error",
                    code: error.status || 500,
                    message: error.message || "",
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
                type: "Application delete all events error",
                code: error.status || 500,
                message: error.message || "",
                detail: "An error in an attempt to delete all records",
            };
            throw(ApplicationError(errorOptions));
        } else {
            log.info('Successfully deleted all records');
        }
    });
};

/**
 * Makes database updates every week at 23:00 Sunday
 */
let updater = schedule.scheduleJob(DATE_SCHEDULE, () => {
    let searchResponse = {};

    searchEvents()
        .then(response => {

            // Check that all the events were unique
            searchResponse.events = uniqueEvents(response);
            searchResponse.count = searchResponse.events.length;

            return searchResponse;
        })
        .then(searchResponse => {

            // Clear database from old events
            deleteAllEvents();

            return searchResponse;
        })
        .then(searchResponse => {

            // Saving new events in database
            createEvent(searchResponse.events);
        })
        .catch(error => {
            log.error(error);
            res.json(error);
        });
});

module.exports = {
    updater
};
