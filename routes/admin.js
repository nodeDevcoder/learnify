const express = require('express');
const router = express.Router({ mergeParams: true });
const Admin = require('../models/admin');
const passport = require('passport');

// login and register routes available to all

router.get('/admin/login', (req, res) => {
    res.render('loginAdmin', {
        title: 'Login to your Admin Account'
    });
});

router.post('/admin/login', passport.authenticate('admin', {
    failureRedirect: '/admin/login', failureFlash: true,
    failureMessage: 'Invalid credentials.',
    keepSessionInfo: true
}), async (req, res) => {
    const redirectUrl = req.session.redirectTo || '/admin/dashboard';
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
});

router.get('/admin/register', (req, res) => {
    res.render('registerAdmin', {
        title: 'Register your Admin Account'
    });
});

router.post('/admin/register', async (req, res) => {
    let { email, password, confirmPassword } = req.body;
    // validations
    let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!email || !password || !confirmPassword) {
        req.flash('error', 'All fields are required');
        return res.redirect('/admin/register');
    } else if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('/admin/register');
    } else if (regex.test(password) === false) {
        req.flash('error', 'Password must match criteria');
        return res.redirect('/admin/register');
    } else if (email.split('@')[1] === 'gmail.com') {
        req.flash('error', 'Please use an educator email address.');
        return res.redirect('/admin/register');
    } else {
        let user = new Admin({ email, username: email });
        await Admin.register(user, password)
            .then(registeredUser => {
                req.login(registeredUser, err => {
                    if (err) {
                        req.flash('error', err.message);
                        return res.redirect('/admin/register');
                    } else {
                        req.flash('success', 'Welcome to Learnify!');
                        res.redirect('/admin/dashboard');
                    }
                });
            })
            .catch(err => {
                req.flash('error', err.message);
                return res.redirect('/admin/register');
            });
    }
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