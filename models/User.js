const crypto = require('crypto');
const mongoose = require('mongoose');
const log = require('libs/log').getLogger(module);
const ApplicationError = require('helpers/applicationError');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

userSchema.virtual('password').set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
}).get(function() {
    return this._plainPassword;
});

userSchema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

userSchema.statics.createUser = function(username, password) {
    let User = this;
    let query = {
        username: username
    };
    let errorOptions = {};
    let options = {};

    return new Promise((resolve, reject) => {

        User.findOne(query, (error, currentUser) => {
            if (currentUser) {
                errorOptions = {
                    type: 'Client error',
                    code: 404,
                    message: 'The user was already exists',
                    detail: 'The username that you try to use already exists'
                };
                reject(ApplicationError.createApplicationError(errorOptions));
            } else {
                options = {
                    username: username,
                    password: password
                };
                let user = new User(options);
                user.save((error, currentUser) => {
                    if (error) {
                        reject(error);
                    } else {
                        log.info('User saved successfully');
                        resolve(currentUser);
                    }
                });
            }
        });
    });
};

userSchema.statics.authorize = function(username, password) {
    let User = this;
    let query = {
        username: username
    };
    let options;
    let errorOptions;

    return new Promise((resolve, reject) => {

        User.findOne(query, (error, currentUser) => {
            if (currentUser) {
                if (currentUser.checkPassword(password)) {
                    // log.info(currentUser);
                    resolve(currentUser);
                } else {
                    errorOptions = {
                        type: 'Authorization error',
                        code: 400,
                        message: 'Bad Request',
                        detail: 'The user has entered invalid password'
                    };
                    reject(ApplicationError.createApplicationError(errorOptions));
                }
            } else {
                errorOptions = {
                    type: 'Authorization error',
                    code: 404,
                    message: 'Not Found',
                    detail: 'User not found'
                };
                reject(ApplicationError.createApplicationError(errorOptions));
            }

            //FIXME: write Sign in module
            // else {
            //     options = {
            //         username: username,
            //         password: password
            //     };
            //     let user = new User(options);
            //     user.save((error, currentUser) => {
            //         if (error) {
            //             reject(error);
            //         } else {
            //             log.info('User saved successfully');
            //             resolve(currentUser);
            //         }
            //     });
            // }

        });
    });
};

let User = mongoose.model('User', userSchema);

module.exports = User;
