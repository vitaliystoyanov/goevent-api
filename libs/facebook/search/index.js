const requestPromise = require('libs/request-promise').requestPromise;
const log = require('libs/log').getLogger(module);
const config = require('config');
const currentDate = require('helpers/currentDate').getCurrentDate();
const beautifyResponse = require('helpers/beautifyResponse').beautifyResponse;
const ApplicationError = require('helpers/applicationError').createApplicationError;

let prefix = 'https://graph.facebook.com/';
let fields = 'id, name, description, owner.fields(name, category), place.fields(id, name, location.fields(name, street, city, country,' +
    'latitude, longitude)), cover.fields(id, source), start_time, end_time';
let events = [];
let errorOptions = {};

/**
 * Call asynchronous function for requests and processes the response Facebook API
 * @param {string} next The next portion of data. Facebook API have a limit for data
 * @return {Promise} Promise function with result or error from response
 */
const searchEvents = (options) => {
    let query;
    let uri;

    if (options && options.query) {
        query = options.query;
    } else {
        query = 'Kyiv';
    }

    if (options && options.next) {
        uri = options.next;
    } else {
        uri = prefix.concat(config.fb.version) + '/search?q=' + query + '&type=event&limit=1000&fields=' +
            fields.concat('&since=' + currentDate) + '&access_token=' + config.fb.user_access_token;
    }

    return new Promise((resolve, reject) => {
        let pagination = {};

        requestPromise(uri)
            .then(response => {
                events = events.concat(response.data);
                if (response.paging && response.paging.next) {
                    pagination.next = response.paging.next;
                    searchEvents(pagination)
                        .then(() => resolve(beautifyResponse(events)));
                } else {
                    resolve(events);
                }
            })
            .catch(error => {
                errorOptions = {
                    type: error.type,
                    code: error.code,
                    message: error.message,
                    detail: error.detail
                };
                log.error(ApplicationError(errorOptions));
                reject(ApplicationError(error.message));
            });
    });
};

module.exports = searchEvents;
