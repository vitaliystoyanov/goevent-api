const express = require('express');
const passport = require('middlewares/auth');
const log = require('libs/log').getLogger(module);
const Event = require('models/Event');
const User = require('models/User');

const userRouter = express.Router();

userRouter.post('/login', (req, res, next) => {
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

userRouter.get('/user-events', (req, res) => {
    let query = {
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
});

userRouter.post('/new-event', (req, res) => {
    let myNewEvent;

    if (req.user) {
        myNewEvent = new Event({
            eventCreator: req.user.id,
            eventDescription: 'TESTFROM THIS USER'
        });
        myNewEvent.save((error) => {
            if (error) {
                log.error(error);
                res.json({error: error.message});
            } else {
                res.json({status: 'success saved'});
            }
        });
    } else {
        res.json({error: 'You must login'});
    }
});

module.exports = userRouter;
