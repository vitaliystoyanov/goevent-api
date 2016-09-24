const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const sessionStore = {};
module.exports = sessionStore;

sessionStore.connection = db => {
    let options = {
        mongooseConnection: db
    };

    return new MongoStore(options);
};

