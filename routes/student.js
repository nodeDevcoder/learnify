const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const Quest = require('../models/quest');
const Admin = require('../models/admin');
const Student = require('../models/student');
const QuestInstance = require('../models/questInstance');
const Log = require('../models/log');
const middleware = require('../config/middleware');

router.get('/login', (req, res) => {
    console.log('student');
    res.render('loginStudent', {
        title: 'Login to your Account'
    });
});

router.post('/login', passport.authenticate('student', {
    failureRedirect: '/login', failureFlash: true,
    failureMessage: 'Invalid credentials.',
    keepSessionInfo: true
}), async (req, res) => {
    const redirectUrl = req.session.redirectTo || '/dashboard';
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us'
    });
});

router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us'
    });
});

router.get('/dashboard', middleware.isStudent, async (req, res) => {
    let quests = await Quest.find({ $or: [{ admin: req.user.admin }, { private: { $ne: true } }] });
    const currentQuests = await QuestInstance.find({ student: req.user._id }).populate('quest');
    quests = quests.filter(q => !currentQuests.some(cq => cq.quest._id.toString() === q._id.toString()));
    res.render('dashboardStudent', {
        title: 'Dashboard',
        quests,
        currentQuests
    });
});

// route handler for where to go when trying to start/resume a quest 
router.get('/quests/learn/:id', middleware.isStudent, async (req, res) => {
    const quest = await Quest.findById(req.params.id).populate('content.id');
    if (quest) {
        let questInstance = await QuestInstance.findOne({
            student: req.user._id,
            quest: req.params.id
        });
        if (questInstance) {
            let newBreakdown = questInstance.contentBreakdown;
            let latest = 0;
            for (let i = 0; i < quest.content.length; i++) {
                const content = quest.content[i];
                const existing = newBreakdown.find(nb => nb.id?._id.toString() === content.id._id.toString());
                if (!existing) {
                    newBreakdown.push({
                        type: content.id.constructor.modelName,
                        id: content.id
                    });
                }
                console.log(questInstance.contentBreakdown[i].progress);
                if (questInstance.contentBreakdown[i].progress >= 0.5) {
                    latest = i;
                }
            }
            questInstance.contentBreakdown = newBreakdown;
            await questInstance.save();
            res.redirect('/quests/learn/' + req.params.id + '/' + quest.content[latest].id._id);
        } else {
            let i = await QuestInstance.create({
                student: req.user._id,
                quest: req.params.id,
                contentBreakdown: quest.content
            });
            console.log('Created new quest', i);
            res.redirect('/quests/learn/' + req.params.id + '/' + i.contentBreakdown[0].id._id);
        }
    } else {
        res.redirect('/dashboard');
    }
});

router.get('/quests/learn/:id/:contentId', middleware.isStudent, async (req, res) => {
    const quest = await Quest.findById(req.params.id).populate('content.id');
    const instance = await QuestInstance.findOne({
        student: req.user._id,
        quest: req.params.id
    });
    if (quest) {
        const content = quest.content.find(c => c.id._id.toString() === req.params.contentId);
        if (content.type === 'Quiz') {
            await content.id.populate({ path: 'questions', populate: { path: 'answers' } });
        }
        if (content) {
            res.render('learn', {
                title: 'Learn',
                quest,
                instance,
                content
            });
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/dashboard');
    }
});

router.post('/quests/learn/:id/contentId', middleware.isStudent, async (req, res) => {
    const instance = await QuestInstance.findOne({
        student: req.user._id,
        quest: req.params.id
    });
    if (instance) {
        const content = instance.contentBreakdown.find(c => c.id._id.toString() === req.body.contentId);
        if (content) {
            let log = await Log.findOne({
                student: req.user._id,
                quest: req.params.id,
                content: content.id,
                time: { $gte: new Date(Date.now()) - 60 * 60 * 1000 },
                action: req.body.action
            });
            if (!log) {
                log = await Log.create({
                    student: req.user._id,
                    quest: req.params.id,
                    content: content.id,
                    startTime: new Date(Date.now()),
                    endTime: new Date(Date.now() + 5 * 1000),
                    action: req.body.action,
                    type: content.type
                });
            }
            if (content.action === 'Initiated Learning') {
                if (instance.progress == 0) {
                    content.progress = 0.1;
                    content.timeSpent = 5 * 1000;

                }
            }
            content.progress = req.body.progress;
            content.timeSpent = req.body.timeSpent;
            content.attempts = req.body.attempts;
            content.score = req.body.score;
            await instance.save();
        }
    } else {
        console.log('No instance found');
        res.send('Invalid Request');
    }
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;