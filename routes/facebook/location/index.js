const requestPromise = require('libs/request-promise').requestPromise;
const config = require('config');
const log = require('libs/log').getLogger(module);
const currentDate = require('helpers/currentDate').getCurrentDate();
const beautifyResponse = require('helpers/beautifyResponse').beautifyResponse;
const ApplicationError = require('helpers/applicationError').createApplicationError;
const uniqueEvents = require('helpers/uniqueEvents').uniqueEvents;

/**
 * Check a geolocation parameters for valid
 * @param {Object} settings Geolocation settings
 */
let checkGeoParams = settings => {
    return (isNaN(Number(settings.latitude)) ? false : isNaN(Number(settings.longitude)) ? false : !(isNaN(Number(settings.distance))));
};

/**
 * Function makes asynchronous requests and processes the response Facebook API by location based on ids
 * @param {Object} geolocation Object parameters of location
 * @param {string} userToken String of user access token if login through Facebook
 * @return {Promise} Promise function with result or error from response
 */
let locationEvents = (geolocation, userToken) => {

    return new Promise((resolve, reject) => {

        // If geolocation parameters is not valid
        let errorOptions = {};
        if (checkGeoParams(geolocation)) {
            const accessToken = (userToken ? userToken : config.get('fb:app_access_token'));
            let prefix = 'https://graph.facebook.com/';
            let uri = prefix + config.get('fb:version') +
                '/search?type=place&q=&center=' + geolocation.latitude + ',' + geolocation.longitude + '&distance=' +
                geolocation.distance + '&limit=1000&fields=id&access_token=' + accessToken;
            let fields = 'events.fields(id, name, place.fields(id, name, location.fields(name, street, city, country,' +
                'latitude, longitude)), cover.fields(id, source), description, start_time, end_time)';
            let idLimit = 50;
            let ids = [];
            let container = [];
            let urls = [];
            let events = [];

            requestPromise(uri)
                .then(response => {

                    // Create array of event ids
                    response.data.forEach((item, index, array) => {
                        container.push(item.id);

                        // Not more 50 id required by facebook api
                        if (container.length >= idLimit) {
                            ids.push(container);
                            container = [];
                        }
                    });

                    // Push remaining places of container
                    if (container.length > 0) {
                        ids.push(container);
                    }

                    return ids;
                })
                .then(ids => {

                    // Create a Graph API request (promisified)
                    ids.forEach((id, index, array) => {
                        let url = prefix.concat(config.get('fb:version')) +
                            '/?ids=' + id.join(',') + '&fields=' + fields + '.since(' + currentDate +
                            ')&access_token=' + accessToken;
                        urls.push(requestPromise(url));
                    });

                    return urls;
                })
                .then(promisifiedRequests => {

                    //Run parallel requests and return array of results
                    return Promise.all(promisifiedRequests);
                })
                .then(results => {

                    /**
                     * Handle all results
                     */
                    results.forEach((data, index, array) => {
                        Object.keys(data).forEach((key, index, array) => {
                            let item = data[key];
                            if (item.events && item.events.data.length > 0) {
                                events = events.concat(item.events.data);
                            }
                        });
                    });
                    resolve(uniqueEvents(beautifyResponse(events)));
                })
                .catch(error => {
                    errorOptions = {
                        type: error.type || '',
                        code: error.code || '',
                        message: error.message || '',
                        detail: error.detail || ''
                    };
                    log.error(ApplicationError(errorOptions));
                    reject(ApplicationError(errorOptions));
                });
        } else {
            errorOptions = {
                type: "Client error",
                code: 400,
                message: "Valid geolocation parameters is required",
                detail: "You must pass-in valid geolocation parameters",
            };
            log.error(ApplicationError(errorOptions));
            reject(ApplicationError(errorOptions));
        }
    });
};

module.exports = {
    locationEvents
};




