const ApplicationError = require('helpers/applicationError').createApplicationError;
const log = require('libs/log').getLogger(module);

/**
 * Function checks Data on valid JSON and handle non-exception-throwing cases
 * @param data Data which need to check of valid JSON
 * @return {boolean} Data is JSON
 */
let isJSON = data => {
    let jsonObj = {};
    try {
        jsonObj = JSON.parse(data.join(''));

        if (jsonObj && typeof jsonObj === 'object') {
            return true;
        }
    }
    catch (error) {
        return false;
    }

    return false;
};

/**
 * Function makes asynchronous requests and processes the response
 * @param {string} url URL by which you do an asynchronous request
 * @param {Object} options Additional settings
 * @return {Promise} Pomise function with result or error from response
 */
const requestPromise = (url, options) => {
    let errorOptions = {};

    return new Promise((resolve, reject) => {
        if (typeof url === 'string') {

            // Select library based on protocol of url
            const lib = url.startsWith('https') ? require('https') : require('http');
            const request = lib.get(url, response => {

                // Handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    errorOptions = {
                        type: 'HttpError',
                        code: response.statusCode,
                        message: 'Failed to load data',
                        detail: 'Failed to load the data that you have requested',
                    };
                    log.error(ApplicationError(errorOptions));
                    reject(ApplicationError(errorOptions));
                }

                // Temporary data holder
                const body = [];
                response.on('data', chunk => body.push(chunk)).on('end', () => {
                    if (isJSON(body)) {
                        resolve(JSON.parse(body.join('')));
                    } else {
                        errorOptions = {
                            type: 'Internal server error',
                            code: 500,
                            message: 'Error in parsing of response',
                            detail: 'Caught error in parsing json response'
                        };
                        log.error(ApplicationError(errorOptions));
                        reject(ApplicationError(errorOptions))
                    }
                });
            });
        } else {
            errorOptions = {
                type: 'Client error',
                code: 400,
                message: 'Type of URL must be a valid string address',
                detail: 'You must pass-in a valid URL address'
            };
            log.error(ApplicationError(errorOptions));
            reject(ApplicationError(errorOptions));
        }
    });
};

module.exports = {
    requestPromise
};
