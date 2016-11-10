const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('models/User');
const log = require('libs/log').getLogger(module);

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
    },
    (username, password, done) => {
        User.authorize(username, password)
            .then(user => done(null, {id: user._id}))
            .catch(error => {
                log.error(error);
                return done(null, false, {error: error});
            });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        done(null, {id: id});
    });
});

module.exports = passport;
