const express = require('express');
const passport = require('middlewares/auth');
const log = require('libs/log').getLogger(module);
const Event = require('models/Event');
const User = require('models/User');
const ApplicationError = require('helpers/applicationError');

const userRouter = express.Router();

userRouter.post('/signin', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    log.info(username);
    log.info(password);
    User.createUser(username, password)
    .then(response => {
        log.info(response);
        res.json(response);
    })
    .catch(error => {
        log.error("Error. ".concat(error));
        res.json(error);
    })
});

userRouter.post('/login', (req, res, next) => {
    log.info(req.body);
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
    log.info('Session destroyed');
    res.send({logout: 'Success'});
});

userRouter.get('/events', (req, res) => {
    let query = {};
    let errorOptions = {};

    log.info(req.user);

    // check if user session available
    if (req.user) {
        query = {
            eventCreator: req.user.id
        };

        Event.find(query, (error, events) => {
            if (error) {
                log.error(error);
                res.json(error);
            } else {
                res.json(events);
            }
        });
    } else {
        errorOptions = {
            type: 'Client error',
            code: 401,
            message: 'Session not found',
            detail: 'You need to be login in system to get your own events'
        };
        let error = ApplicationError.createApplicationError(errorOptions);
        // error.status = 401;
        res.json(error);
    }
});

userRouter.post('/events', (req, res) => {
    let myNewEvent;
    let errorOptions = {};

    if (req.user) {
        myNewEvent = new Event({eventCreator: req.user.id, eventDescription: 'TESTFROM THIS USER2'});
        myNewEvent.save((error) => {
            if (error) {
                log.error(error);
                res.json({error: error.message});
            } else {
                res.json({status: 'Success saved new event'});
            }
        });
    } else {
        errorOptions = {
            type: 'Client error',
            code: 401,
            message: 'Session not found',
            detail: 'You need to be login in system to post your own events'
        };
        let error = ApplicationError.createApplicationError(errorOptions);
        // error.status = 401;
        res.json(error);
    }
});

module.exports = userRouter;
