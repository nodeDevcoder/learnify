if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const Student = require('./models/student.js');
const app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(cookieParser(process.env.SECRET));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('trust proxy', true);

app.use(morgan('combined'));

mongoose.connect(process.env.DB_URL || 'mongodb://127.0.0.1:27017/learnify')
    .then(() => console.log('Connected to DB!'))
    .catch((error) => console.log(error.message));

app.use(session({
    name: 'learnify-session',
    secret: process.env.SECRET || 'supersecret01438929',
    resave: false,
    saveUninitialized: false,
    cookie: {
        name: 'learnify-auth',
        maxAge: 24000 * 60 * 60 * 14, // 14 days
        secure: 'auto'
    },
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL || 'mongodb://127.0.0.1:27017/learnify'
    })
})
);


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.companyName = 'Learnify';
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    res.locals.success = req.flash('success');
    res.locals.protocol = req.protocol;
    res.locals.production = process.env.NODE_ENV == 'production';
    res.locals.hostURL = req.get('host');
    next();
});

app.use(require('./routes/home.js'));
app.use(require('./routes/student.js'));
app.use(require('./routes/admin.js'));


// User Auth Code

passport.serializeUser(function (user, done) {
    user.accountType = user.constructor.modelName; // Parent, Admin, or Child
    done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
    try {
        let user = await Student.findOne({ _id: id });
        // if (!user) user = await Child.findOne({ _id: id });
        // if (!user) user = await Admin.findOne({ _id: id });
        user.accountType = user.constructor.modelName; // Parent, Admin, or Child
        done(null, user);
    } catch (err) {
        done(err);
    }
});


passport.use('student', new LocalStrategy(Student.authenticate()));
// passport.use('child', new LocalStrategy(Child.authenticate()));
// passport.use('admin', new LocalStrategy(Admin.authenticate()));


app.listen(8080, () => {
    console.log('Server started on port 3000');
})