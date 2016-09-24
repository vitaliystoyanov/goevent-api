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

client
    .on('ready', () => log.info('Redis successfully connect'))
    .on('end', () => log.info('Redis connection closed'))
    .on('error', error => log.error(`Redis error. ${error}`));

eventRouter.get('/events', (req, res) => {
    let pagination = {};
    let fields;
    let query = {};
    let data = {};

    pagination.skip = (req.query.offset ? req.query.offset : null);
    pagination.limit = (req.query.limit ? req.query.limit : null);
    fields = (req.query.fields ? req.query.fields : null);
    fields = (fields === null ? {} : fields.replace(/,/g, ' '));

    if(req.user) log.info(req.user.id);


    if (!(pagination.skip && pagination.limit)) {
        client.get('db_events', (error, value) => {

            if (error) {
                return log.error(error);
            }

            // Check if cache is not cashed
            if (!value) {
                Event.find({}, fields, {}, (error, response) => {

                    if (error) {
                        return log.error(error);
                    }

                    Event.count({}, (error, count) => {
                        data.events = response;
                        data.count = count;
                        log.info('Response from database query');
                        res.json(data);

                        // Cache into redis
                        client.set('db_events', JSON.stringify(data), error => {

                            if (error) {
                                return log.error(error);
                            }

                            // Expire query in 40 seconds
                            client.expire('db_events', 40);
                            log.info('Sucessfully cached data');
                        });
                    });
                });
            } else {
                log.info('Data from cache');
                res.json(JSON.parse(value));
            }
        });
    } else {
        Event.find(query, fields, pagination, (error, response) => {

            if (error) {
                return log.error(error);
            }

            Event.count({}, (err, count) => {
                data.events = response;
                data.count = count;
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

    // req.session.eventId = id;

    client.get('db_events', (error, value) => {

        if (error) {
            return log.error(error);
        }

        // Check if cache is not cashed
        if (!value) {
            Event.findOne(query, (error, event) => {

                if (error) {
                    return log.error(error);
                }

                if (event === null) {
                    errorOptions = {
                        type: 'Client query error',
                        code: 404,
                        message: 'Event not found',
                        detail: 'Event which you try to found is not exist by id: '.concat(id)
                    };
                    log.error(ApplicationError(errorOptions));
                    res.status(404).json(ApplicationError(errorOptions));
                } else {
                    log.info('Event from database query');
                    res.json(event);
                }
            });
        } else {

            // Check your event by id in cache
            JSON.parse(value).events.forEach(item => {
                if (id === item.eventId) {
                    data = item;
                }
            });

            // If event by id was found in cache
            if (data) {
                log.info('Event from cache');
                res.json(data);
            } else {
                errorOptions = {
                    type: 'Client query error',
                    code: 404,
                    message: 'Event not found',
                    detail: 'Event which you try to found is not exist by id'.concat(id)
                };
                log.error(ApplicationError(errorOptions));
                res.status(404).json(ApplicationError(errorOptions));
            }
        }
    });
});

eventRouter.get('/events-location', (req, res) => {
    // const userAccessToken = config.get('fb:user_access_token');
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


