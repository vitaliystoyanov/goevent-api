global.api = {};

const db = require('./db');
api.app = require('./app').api(db);
const config = require('config');
const log = require('./libs/log').getLogger(module);

// event listener for HTTP server "listening" event
const onListening = error => log.info(`Server listening on port: ${config.get('port')}`);

// event listener for HTTP server "error" event
const onError = error => log.error(`Error server listening: ${error}`);

// create http server and listen on provided port, on all network interfaces
api.server = api.app.listen(config.get('port'), () => {
    log.info(`Connecting on port : ${config.get('port')}`);
}).on('listening', onListening).on('error', onError);

module.exports = api;
