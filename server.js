global.api = {};
api.http = require('http');

const db = require('./db');
const app = require('./app').api(db);
const config = require('config');
const log = require('./libs/log').getLogger(module);

/**
 * Event listener for HTTP server "listening" event
 */
const onListening = error => log.info(`Server listening on port: ${config.get('port')}`);

/**
 * Event listener for HTTP server "error" event
 */
const onError = error => log.error(`Error server listening: ${error}`);

/**
 * Create HTTP server and listen on provided port, on all network interfaces
 */
api.http.createServer(app)
    .listen(config.get('port'))
    .on('listening', onListening)
    .on('error', onError);


