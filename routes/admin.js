const express = require('express');
const router = express.Router({ mergeParams: true });
const Admin = require('../models/admin');

// login and register routes available to all

router.get('/admin/register', (req, res) => {
    res.render('registerAdmin', {
        title: 'Register your Admin Account'
    });
});

router.post('/admin/register', (req, res) => {
    let { email, password } = req.body;

    Admin.register({ email, password }, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/admin/register');
        }
        passport.authenticate('admin')(req, res, () => {
            req.flash('success', 'Welcome to Learnify ' + user.username);
            res.redirect('/admin/dashboard');
        });
    });
});

// dashboard routes for admin

router.get('/admin/dashboard', (req, res) => {
    res.render('dashboardAdmin', {
        title: 'Dashboard'
    });
});

// login routes for students [vhosted on domain]

// dashboard routes for students [vhosted on domain]


module.exports = router;