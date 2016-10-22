const express = require('express');
const redis = require('redis');
const log = require('libs/log').getLogger(module);
const Event = require('models/Event');
const User = require('models/User');
const config = require('config');
const locationEvents = require('./location').locationEvents;
const ApplicationError = require('helpers/applicationError').createApplicationError;

const eventRouter = express.Router();
const client = redis.createClient();

let redisConnection = false;

client.on('ready', () => {
    redisConnection = true;
    log.info('Redis successfully connect');
}).on('end', () => log.info('Redis connection closed')).on('error', error => {
    redisConnection = false;
    log.error(`Redis error. ${error}`);
});

eventRouter.get('/events', (req, res) => {
    let pagination = {};
    let fields;
    let query = {};
    let data = {};
    let errorOptions = {};

    pagination.skip = (req.query.offset ? req.query.offset : null);
    pagination.limit = (req.query.limit ? req.query.limit : null);
    fields = (req.query.fields ? req.query.fields : null);
    fields = (fields === null ? {} : fields.replace(/,/g, ' '));

    // get all events from database and cache data into redis
    if (pagination.skip === null && pagination.limit === null) {
        if (redisConnection) {
            client.get('db_events', (error, value) => {

                // if something gone wrong
                if (error) {
                    errorOptions = {
                        type: "Server Error",
                        code: 502,
                        message: "Bad Gateway",
                        detail: "Problem with getting data. ".concat(error.message)
                    };
                    res.status(errorOptions.code).json(ApplicationError(errorOptions));
                    return log.error(ApplicationError(errorOptions));
                }

                // check if cache is not cashed
                if (!value) {
                    Event.find({}, fields, {}, (error, response) => {

                        if (error) {
                            errorOptions = {
                                type: "Server Error",
                                code: 500,
                                message: "Internal Server Error",
                                detail: "Problem with request to get events from database. ".concat(error.message)
                            };
                            res.status(errorOptions.code).json(ApplicationError(errorOptions));
                            return log.error(ApplicationError(errorOptions));
                        }

                        Event.count({}, (error, count) => {
                            data.events = response;
                            data.count = count;
                            log.info('Response from database query');
                            res.json(data);

                            // cache into redis
                            client.set('db_events', JSON.stringify(data), error => {

                                if (error) {
                                    errorOptions = {
                                        type: "Server Error",
                                        code: 500,
                                        message: "Internal Server Error",
                                        detail: "Problem with caching data to memory. ".concat(error.message)
                                    };
                                    res.status(errorOptions.code).json(ApplicationError(errorOptions));
                                    return log.error(ApplicationError(errorOptions));
                                }

                                // expire query in 40 seconds
                                client.expire('db_events', 40);
                                log.info('Sucessfully cached data');
                            });
                        });
                    });
                } else {

                    // get data from memory cache
                    log.info('Data from cache');
                    res.json(JSON.parse(value));
                }
            });
        } else {
            Event.find({}, {}, {}, (error, response) => {

                if (error) {
                    errorOptions = {
                        type: "Server Error",
                        code: 500,
                        message: "Internal Server Error",
                        detail: "Problem with request to get events from database. ".concat(error.message)
                    };
                    res.status(errorOptions.code).json(ApplicationError(errorOptions));
                    return log.error(ApplicationError(errorOptions));
                }

                Event.count({}, (error, count) => {
                    data.events = response;
                    data.count = count;
                    log.info('Response from database query, without caching');
                    res.json(data);
                });
            });
        }

        // if the parameters have been transferred
    } else if (isNaN(Number(pagination.skip)) || isNaN(Number(pagination.limit))) {
        errorOptions = {
            type: "Client error",
            code: 400,
            message: "Bad Request",
            detail: "You must pass-in valid skip and limit parameters"
        };
        res.status(errorOptions.code).json(ApplicationError(errorOptions));
        return log.error(ApplicationError(errorOptions));
    } else {
        pagination.limit = Number(pagination.limit);
        pagination.skip = Number(pagination.skip);
        Event.find(query, fields, pagination, (error, response) => {

            if (error) {
                errorOptions = {
                    type: "Server Error",
                    code: 500,
                    message: "Internal Server Error",
                    detail: "Problem with request to get events from database, when pass parameters. ".concat(error.message)
                };
                res.status(errorOptions.code).json(ApplicationError(errorOptions));
                return log.error(ApplicationError(errorOptions));
            }

            Event.count({}, (error, count) => {
                data.events = response;
                data.count = count;
                log.info('Response from database query, without caching');
                res.json(data);
            });
        });
    }
});

eventRouter.get('/events/:id', (req, res) => {
    let id = req.params.id;
    let query = {
        'eventId': id
    };
    let data;
    let errorOptions = {};

    if (isNaN(Number(id))) {
        errorOptions = {
            type: "Client error",
            code: 400,
            message: "Bad Request",
            detail: "You must pass-in valid id parameter"
        };
        res.status(errorOptions.code).json(ApplicationError(errorOptions));
        return log.error(ApplicationError(errorOptions));
    }

    client.get('db_events', (error, value) => {

        if (error) {
            errorOptions = {
                type: "Server Error",
                code: 502,
                message: "Bad Gateway",
                detail: "Problem with getting data. ".concat(error.message)
            };
            res.status(errorOptions.code).json(ApplicationError(errorOptions));
            return log.error(ApplicationError(errorOptions));
        }

        // check if cache is not cashed
        if (!value) {
            Event.findOne(query, (error, event) => {

                if (error) {
                    errorOptions = {
                        type: "Server Error",
                        code: 500,
                        message: "Internal Server Error",
                        detail: "Problem with request to get events from database. ".concat(error.message)
                    };
                    res.status(errorOptions.code).json(ApplicationError(errorOptions));
                    return log.error(ApplicationError(errorOptions));
                }

                if (event === null) {
                    errorOptions = {
                        type: 'Client Error',
                        code: 404,
                        message: 'Not Found',
                        detail: 'Event which you try to found is not exist by id: '.concat(id)
                    };
                    log.error(ApplicationError(errorOptions));
                    res.status(errorOptions.code).json(ApplicationError(errorOptions));
                } else {
                    log.info('Event from database query');
                    res.json(event);
                }
            });
        } else {

            // check your event by id in cache
            JSON.parse(value).events.forEach(item => {
                if (id === item.eventId) {
                    data = item;
                }
            });

            // if event by id was found in cache
            if (data) {
                log.info('Event from cache');
                res.json(data);
            } else {
                errorOptions = {
                    type: 'Client Error',
                    code: 404,
                    message: 'Not Found',
                    detail: 'Event which you try to found is not exist by id: '.concat(id)
                };
                log.error(ApplicationError(errorOptions));
                res.status(errorOptions.code).json(ApplicationError(errorOptions));
            }
        }
    });
});

eventRouter.get('/events-location', (req, res) => {
    let locationResponse = {};
    let params = {};

    params.latitude = req.query.lat;
    params.longitude = req.query.lng;
    params.distance = (req.query.distance ? req.query.distance : 2500);

    locationEvents(params)
    .then(response => {
        locationResponse.events = response;
        locationResponse.count = locationResponse.events.length;
        res.json(locationResponse);
    })
    .catch(error => {
        log.error(error);
        res.status(error.code).json(error);
    });
});

module.exports = eventRouter;
