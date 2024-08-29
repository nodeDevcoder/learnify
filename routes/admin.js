const express = require('express');
const router = express.Router({ mergeParams: true });
const Admin = require('../models/admin');
const Quest = require('../models/quest');
const Article = require('../models/article');
const Project = require('../models/project');
const Question = require('../models/question');
const Answer = require('../models/answer');
const Quiz = require('../models/quiz');
const Video = require('../models/video');
const Student = require('../models/student');
const mongoose = require('mongoose');
const passport = require('passport');
const middleware = require('../config/middleware');


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

router.get('/admin/dashboard', middleware.isAdmin, async (req, res) => {
    const quests = await Quest.find({ status: 'Active' });
    res.render('dashboardAdmin', {
        title: 'Dashboard', quests
    });
});

router.get('/admin/students', middleware.isAdmin, async (req, res) => {
    const students = await Student.find({ admin: req.user._id, status: 'Active' });
    res.render('studentsAdmin', {
        title: 'Manage Students',
        students
    });
});

router.post('/admin/students', middleware.isAdmin, async (req, res) => {
    const students = JSON.parse(req.body.questions);
    for (let i = 0; i < students.length; i++) {
        let student = await Student.findOne({ admin: req.user._id, email: students[i]['Email'] });
        if (!student) {
            let s = new Student({
                firstName: students[i]['First Name'],
                lastName: students[i]['Last Name'],
                email: students[i]['Email'],
                id: students[i]['Id'],
                status: 'Active',
                admin: req.user._id
            });
            await Student.register(s, '$123Test').then(registeredUser => {
                student = registeredUser;
                console.log('Created Student');
            });
        } else {
            student = await Student.findOneAndUpdate({ email: students[i]['Email'] }, { $set: { firstName: students[i]['First Name'], lastName: students[i]['Last Name'], email: students[i]['Email'], id: students[i]['Id'], status: 'Active' } }, { new: true });
        }
    }
    res.redirect('/admin/students');
});

router.get('/admin/quests', middleware.isAdmin, async (req, res) => {
    const quests = await Quest.find({ status: 'Active' });
    res.render('questsAdmin', {
        title: 'Quests',
        quests
    });
});

router.get('/admin/quests/create', middleware.isAdmin, (req, res) => {
    res.render('createQuest', {
        title: 'Create A Quest'
    });
});

router.post('/admin/quests/create', middleware.isAdmin, async (req, res) => {
    try {
        let { name, category, gradeLevel, description } = req.body;
        console.log(req.body);
        if (!name || !category || !gradeLevel || !description) {
            req.flash('error', 'All fields are required');
            return res.redirect('/admin/quests/create');
        }

        const quest = await Quest.create({ name, category, gradeLevel, description, status: 'Active' });

        res.redirect('/admin/quests/' + quest._id + '/edit');
    } catch (err) {
        console.log(err);
        req.flash('error', err.message);
        return res.redirect('/admin/quests/create', { prefill: req.body });
    }
});

router.get('/admin/quests/:id/edit', middleware.isAdmin, async (req, res) => {
    const quest = await Quest.findById(req.params.id).populate('content.id');
    res.render('editQuest', {
        title: 'Edit Quest',
        quest
    });
});

router.post('/admin/quests/:id/edit', middleware.isAdmin, async (req, res) => {
    // reorder content
    const quest = await Quest.findById(req.params.id);
    // let questions = await Question.find({ correctAnswer: { $ne: false } });
    // let quiz = await Quiz.findOne();
    // quest.content.push({
    //     type: 'Quiz',
    //     id: quiz
    // });
    // let video = await Video.findOne();
    // quest.content.push({
    //     type: 'Video',
    //     id: video
    // });
    // let project = await Project.findOne();
    // quest.content.push({
    //     type: 'Project',
    //     id: project
    // });
    let x = req.body.order;
    quest.content = x;
    await quest.save();
    res.send({ success: true, quest });
});

router.get('/admin/quests/:id/add', middleware.isAdmin, async (req, res) => {
    const quest = await Quest.findById(req.params.id);
    res.render('createContent', {
        title: 'Add Content',
        quest
    });
});

router.post('/admin/quests/:id/add', middleware.isAdmin, async (req, res) => {
    if (!req.body.category || !req.body.title) {
        req.flash('error', 'All fields are required');
        return res.redirect('/admin/quests/' + req.params.id + '/add');
    } else {
        const quest = await Quest.findById(req.params.id);
        let id;
        if (req.body.category === 'Article') {
            const a = await Article.create({
                title: req.body.title,
                author: req.body.author,
            });
            id = a._id;
        } else if (req.body.category === 'Quiz') {
            const a = await Quiz.create({
                title: req.body.title
            });
            id = a._id;
        } else if (req.body.category === 'Video') {
            const a = await Video.create({
                title: req.body.title
            });
            id = a._id;
        } else if (req.body.category === 'Project') {
            const a = await Project.create({
                title: req.body.title
            });
            id = a._id;
        }
        quest.content.push({
            type: req.body.category,
            id
        });
        await quest.save();
        res.redirect('/admin/quests/' + quest._id + '/edit');
    }
});

router.get('/admin/quests/:id/items/:uid/edit', middleware.isAdmin, async (req, res) => {
    const quest = await Quest.findById(req.params.id).populate('content.id');
    const item = quest.content.find(c => c.id._id.toString() === req.params.uid);
    if (item.type == 'Quiz') {
        await item.id.populate({ path: 'questions', populate: { path: 'answers' } });
    }
    res.render('editContent', {
        title: `Edit ${item.type}: ${item.id.title} - ${quest.name}`,
        quest,
        item
    });
});

router.post('/admin/quests/:id/items/:uid/edit', middleware.isAdmin, async (req, res) => {
    const quest = await Quest.findById(req.params.id).populate('content.id');
    const item = quest.content.find(c => c.id._id.toString() === req.params.uid);
    if (!req.body.title) {
        req.flash('error', 'All fields are required');
        return res.redirect('/admin/quests/' + req.params.id + '/items/' + req.params.uid + '/edit');
    } else {
        switch (item.type) {
            case 'Article':
                item.id.title = req.body.title;
                item.id.author = req.user;
                item.id.content = req.body.content;
                await item.id.save();
                break;
            case 'Video':
                item.id.title = req.body.title;
                item.id.url = req.body.url;
                await item.id.save();
                break;
            case 'Project':
                item.id.title = req.body.title;
                item.id.description = req.body.description;
                await item.id.save();
                break;
            case 'Quiz':
                item.id.title = req.body.title;
                if (req.body.questions) {
                    for (const i of JSON.parse(req.body.questions)) {
                        let ans = i['Answer Choices - separated by ::'].trim().split('::');
                        let m = [];
                        for (const a of ans) {
                            let x = await Answer.create({
                                text: a.trim(),
                            });
                            m.push(x);
                        }
                        console.log(ans[Number(i['Correct Answer Index - Start at 1']) - 1]);
                        let q = await Question.create({
                            text: i['Questions'],
                            answers: m,
                            correctAnswer: m.find(a => a.text === ans[Number(i['Correct Answer Index - Start at 1']) - 1])
                        });
                        item.id.questions.push(q);
                    }
                }
                await item.id.save();
                break;
        }
        res.redirect('/admin/quests/' + quest._id + '/edit');

    }
});


// login routes for students [vhosted on domain]

// dashboard routes for students [vhosted on domain]


module.exports = router;