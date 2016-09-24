const mongoose = require('mongoose');
const config = require('config');
const log = require('libs/log').getLogger(module);

mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));

/**
 * Event listener for Database "successful connection" event and "error" event
 */
mongoose.connection
    .once('open', () => log.info(`Mongoose successfully connect`))
    .on('connected', () => log.info(`Mongoose default connection open`))
    .on('disconnected', () =>log.info(`Mongoose default connection disconnected`))
    .on('error', error => log.error(`Mongoose connection error: ${error.message}`));

/**
 * If the Node process ends, close the Mongoose connection
 */
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        log.info(`Mongoose default connection disconnected through app termination`);
        process.exit(0);
    });
});

module.exports = mongoose.connection;
