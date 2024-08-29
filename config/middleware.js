

module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.constructor.modelName === 'Admin') {
        return next();
    }
    req.flash('error', 'Unauthorized Request');
    res.redirect('/login');
};


module.exports.isStudent = (req, res, next) => {
    if (req.user && req.user.constructor.modelName === 'Student') {
        return next();
    }
    req.flash('error', 'Unauthorized Request');
    res.redirect('/login');
}