const headerOverride = {};
module.exports = headerOverride;

headerOverride.getChangeHeader = (req, res, next) => {
    res.set('X-Powered-By', 'Event service');
    next();
};
