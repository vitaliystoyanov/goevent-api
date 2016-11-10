const express = require('express');
const passport = require('middlewares/auth');
const log = require('libs/log').getLogger(module);
const Event = require('models/Event').Event;
const UserEvent = require('models/Event').UserEvent;
const User = require('models/User');
const ApplicationError = require('helpers/applicationError');

const userRouter = express.Router();

userRouter.post('/signin', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    User.createUser(username, password)
        .then(response => {
            // log.info(response);
            res.json(response);
        })
        .catch(error => {
            log.error("Error. ".concat(error));
            res.status(error.code).json(error);
        })
});

userRouter.post('/login', (req, res, next) => {
    // log.info(req.body);
    passport.authenticate('local', (info, user, error) => {
        if (error) {
            return res.json(error);
        }
        req.login(user, (error) => {
            if (error) {
                return next(error);
            }
            return res.json(req.user.id);
        });
    })(req, res, next);
});

userRouter.post('/logout', (req, res) => {
    // req.session.destroy();
    req.logout();
    let status = Boolean(!req.user);
    log.info('User session destroyed successfully');
    res.send({logout: status});
});

userRouter.get('/events', (req, res) => {
    let query = {};
    let errorOptions = {};

    // check if user session available
    if (req.user) {
        query = {
            eventCreator: req.user.id
        };

        UserEvent.find(query, (error, events) => {

            if (error) {
                log.error(error);
                res.status(404).json(error);
            } else {
                res.json(events);
            }
        });
    } else {
        errorOptions = {
            type: 'Client error',
            code: 401,
            message: 'Unauthorized',
            detail: 'You need to be login in system to get your own events'
        };
        let error = ApplicationError.createApplicationError(errorOptions);
        res.status(error.code).json(error);
    }
});

userRouter.post('/events/:id', (req, res) => {
    let userEvent;
    let errorOptions = {};

    let query = {
        eventId: req.params.id
    };

    if (req.user) {
        Event.find(query, (error, event) => {

            if (error) {

                return res.status(404).json({error: error});
            }

            // casting the array
            event = event[0];

            // creating new record
            userEvent = new UserEvent({
                eventCreator: req.user.id,
                eventPicture: event.eventPicture,
                eventId: event.eventId,
                eventName: event.eventName,
                eventDescription: event.eventDescription,
                eventCategory: event.eventCategory,
                eventStartTime: event.eventStartTime,
                eventEndTime: event.eventEndTime,
                eventLocation: event.eventLocation
            });

            // saving new record
            userEvent.save(error => {
                if (error) {
                    log.error(error);

                    return res.status(500).json({error: error.message});
                } else {

                    return res.json({
                        status: true,
                        message: 'Successfully saved new event'
                    });
                }
            });
        });

    } else {
        errorOptions = {
            type: 'Client error',
            code: 401,
            message: 'Unauthorized',
            detail: 'You need to be login in system to post your own events'
        };
        let error = ApplicationError.createApplicationError(errorOptions);
        res.status(error.code).json(error);
    }
});

userRouter.delete('/events/:id', (req, res) => {
    let query = {};
    let errorOptions = {};

    query.eventId = req.params.id;

    if (req.user) {
        UserEvent.find(query, (error, event) => {

            if (event[0].eventCreator == req.user.id) {
                UserEvent.remove(query, (error, success) => {

                    if (error) {

                        return res.status(500).json(error);
                    }

                    res.json({message: 'Successfully deleted event'});
                });
            } else {
                errorOptions = {
                    type: 'Client error',
                    code: 404,
                    message: 'Event not found',
                    detail: 'You need to pass an existing id of your events'
                };
                let error = ApplicationError.createApplicationError(errorOptions);
                res.status(404).json(error);
            }
        });
    } else {
        errorOptions = {
            type: 'Client error',
            code: 401,
            message: 'Unauthorized',
            detail: 'You need to be login in system to post your own events'
        };
        let error = ApplicationError.createApplicationError(errorOptions);
        res.status(error.code).json(error);
    }
});

module.exports = userRouter;
