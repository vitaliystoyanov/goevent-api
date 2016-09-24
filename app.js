const app = {};
app.api = db => {

    /**
     * Module dependencies
     */
    const path = require('path');
    const express = require('express');
    const cookieParser = require('cookie-parser');
    const session = require('express-session');
    const sessionStore = require('./libs/session-store');
    const bodyParser = require('body-parser');
    const passport = require('middlewares/auth');
    const morgan = require('morgan');
    const config = require('./config');

    // Routes
    const eventRouter = require('./routes/facebook');
    const userRouter = require('./routes/user');

    // Helpers
    const eventUpdater = require('./helpers/eventUpdater').updater;
    const ApplicationError = require('helpers/applicationError');

    // Middlewares
    const changeHeader = require('./middlewares/changeHeader').getChangeHeader;
    const cors = require('./middlewares/crossOriginRequest').getCrossOriginRequest;

    let app = express();

    let tiny = ":method :url :status :res[content-length] - :response-time ms";
    let sessionOptions = {
        secret: config.get('session:secret'),
        key: config.get('session:key'),
        resave: false,
        saveUninitialized: false,
        store: sessionStore.connection(db)
    };

    // Setting up static files
    // app.use(express.static(path.join(__dirname.split('/').splice(0, 6).join('/'), '/frontend/build')));

    // View engine setup
    app.engine('jade', require('jade').renderFile);
    app.set('views', path.join(__dirname, '/views'));
    app.set('view engine', 'jade');

    // All environments
    app.use(cors);
    app.use(changeHeader);
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(session(sessionOptions));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(morgan(tiny));

    // Setting up a routers
    app.use('/v1.0', eventRouter);
    app.use('/v1.0/user', userRouter);

    // Catch 404 and forward to error handler
    app.use((req, res, next) => {
        let errorOptions = {
            type: 'Application error',
            code: 404,
            message: 'Page not found',
            detail: 'The page you were trying to open could not be found'
        };
        let error = ApplicationError.createApplicationError(errorOptions);
        error.status = 404;
        next(error);
    });

    // Development error handler will print stacktrace
    if (app.get('env') === 'development') {
        app.use((error, req, res, next) => {
            res.status(error.status || 500);
            res.render('error', {
                error: error
            });
        });
    }

    // Production error handler no stacktraces leaked to user
    app.use((error, req, res, next) => {
        res.status(error.status || 500);
        res.render('error', {
            error: {}
        });
    });

    return app;

};

module.exports = app;



