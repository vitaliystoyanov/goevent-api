// const User = require('models/User');
//
// const userLoader = (req, res, next) => {
//     req.user = res.locals.user = null;
//
//     if (!req.session.user) {
//         return next();
//     } else {
//         console.log(req.session);
//         User.findById(req.session.user, (error, user) => {
//             if (error) {
//                 return next(error);
//             } else {
//                 req.user = res.locals.user = user;
//                 next();
//             }
//         });
//     }
// };
//
// module.exports = userLoader;

