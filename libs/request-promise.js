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

            // select library based on protocol of url
            const lib = url.startsWith('https') ? require('https') : require('http');
            const request = lib.get(url, response => {

                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    errorOptions = {
                        type: 'Server Error',
                        code: 500,
                        message: 'Internal Server Error',
                        detail: 'Failed to load the data that you have requested',
                    };
                    log.error(ApplicationError(errorOptions));
                    reject(ApplicationError(errorOptions));
                }

                // temporary data holder
                const body = [];
                response.on('data', chunk => body.push(chunk)).on('end', () => {
                    if (isJSON(body)) {
                        resolve(JSON.parse(body.join('')));
                    } else {
                        errorOptions = {
                            type: 'Server Error',
                            code: 500,
                            message: 'Internal Server Error',
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
                message: 'Bad Request',
                detail: 'You must pass-in a valid string URL address'
            };
            log.error(ApplicationError(errorOptions));
            reject(ApplicationError(errorOptions));
        }
    });
};

module.exports = {
    requestPromise
};
