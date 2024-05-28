// authMiddleware.js
module.exports = function (req, res, next) {
    if (req.session && req.session.userId) {
        // User is authenticated
        next();
    } else {
        // User is not authenticated, redirect to sign-in
        res.redirect('/signin');
    }
};
