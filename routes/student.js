const express = require('express');
const router = express.Router({ mergeParams: true });


router.get('/login', (req, res) => {
    console.log('student')
    res.render('loginStudent', {
        title: 'Login to your Account'
    });
})

router.get('/dashboard', (req, res) => {
    res.render('dashboardStudent', {
        title: 'Dashboard'
    });
})

module.exports = router