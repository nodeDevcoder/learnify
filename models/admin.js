const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    county: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
}, { timestamps: true });

adminSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Admin', adminSchema);