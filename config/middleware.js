

module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    req.flash('error', 'Unauthorized');
    res.redirect('/login');
}