const headerOverride = {};
module.exports = headerOverride;

headerOverride.getChangeHeader = (req, res, next) => {
    res.set('X-Powered-By', 'geEvent service');
    next();
};
