const app = {};
app.api = db => {

    /**
     * Module dependencies
     */
    const path = require('path');
    const express = require('express');
    const cookieParser = require('cookie-parser');
    const session = require('express-session');
    const sessionStore = require('libs/session-store');
    const bodyParser = require('body-parser');
    const passport = require('middlewares/auth');
    const morgan = require('morgan');
    const config = require('config');

    // routes
    const eventRouter = require('routes/event');
    const userRouter = require('routes/user');

    // helpers
    const eventUpdater = require('helpers/eventUpdater').updater;
    const ApplicationError = require('helpers/applicationError');

    // middlewares
    const changeHeader = require('middlewares/changeHeader').getChangeHeader;
    const cors = require('middlewares/crossOriginRequest').getCrossOriginRequest;

    let app = express();
    let tiny = ":method :url :status :res[content-length] - :response-time ms";

    console.log('Mode run: ' + app.get('env'));

    if (config.util.getEnv('NODE_ENV') !== 'test') {
        //use morgan to log at command line
        app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
    } else {
        app.use(morgan(tiny));
    }

    let sessionOptions = {
        secret: config.session.secret,
        key: config.session.key,
        resave: false,
        saveUninitialized: false,

        // session time expires
        clear_interval: 60,
        cookie: {
            maxAge: 20000
        },
        store: sessionStore.connection(db)
    };

    // setting up static files
    // app.use(express.static(path.join(__dirname.split('/').splice(0, 6).join('/'), '/frontend/build')));

    // view engine setup
    app.set('port', process.env.PORT || 3000);
    app.engine('jade', require('jade').renderFile);
    app.set('views', path.join(__dirname, '/views'));
    app.set('view engine', 'jade');

    // all environments
    app.use(cors);
    app.use(changeHeader);
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(session(sessionOptions));
    app.use(passport.initialize());
    app.use(passport.session());

    // setting up a routers
    app.use('/v1.0', eventRouter);
    app.use('/v1.0/user', userRouter);

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        let errorOptions = {
            type: 'Client Error',
            code: 404,
            message: 'Page not found',
            detail: 'The page you were trying to open could not be found'
        };
        let error = ApplicationError.createApplicationError(errorOptions);
        error.status = 404;
        next(error);
    });

    // development error handler will print stacktrace and render view
    if (app.get('env') === 'development') {
        app.use((error, req, res, next) => {
            res.status(error.status || 500);
            res.json(error);

            // should rest service generate pages?
            res.render('error', {
                error: error
            });

        });
    } else {
        app.use((error, req, res, next) => {
            res.status(error.status || 500).json(error);
        });
    }

    // production error handler no stacktraces leaked to user
    app.use((error, req, res, next) => {
        res.status(error.status || 500);
        res.render('error', {
            error: {}
        });
    });

    return app;

};

module.exports = app;
