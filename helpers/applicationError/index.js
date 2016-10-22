/**
 * This factory arrow function create a new instance of the App Error object,
 * ensuring that it properly extends from the Error class.
 * @param {Object} settings Options like [type, message, details, extendedInfo, errorCode]
 */
let createApplicationError = settings => new ApplicationError(settings, createApplicationError);

/**
 * Custom Error class
 * @param {Object} settings The settings is a hash of optional properties for the error instance:
 * type: Type of error being thrown.
 * message: Reason the error is being thrown.
 * detail: Explanation of the error.
 * code: Custom error code associated with this type of error.
 * @param {Object} factoryContext This argument can be used to trim the generated stacktrace.
 * If not provided, it defaults to AppError.
 */
class ApplicationError extends Error {
    constructor(settings, factoryContext) {
        super();

        // ensure that settings exists
        settings = (settings || {});

        // override the default name property
        this.name = 'Error handler';

        // each of the following properties can be optionally passed-in as part of the settings argument
        this.type = (settings.type || 'Default Error');
        this.code = (settings.code || '');
        this.message = (settings.message || 'An error occurred');
        this.detail = (settings.detail || '');


        // Capture the current stacktrace and store it in the property "this.stack".
        // By providing the implementationContext argument, we will remove the current constructor
        // (or the optional factory function) line-item from the stacktrace
        Error.captureStackTrace(this, (factoryContext || ApplicationError));
    }
}

// exports object module with factory arrow function and custom Error class
module.exports = {
    createApplicationError,
    ApplicationError
};
