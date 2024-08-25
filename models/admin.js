const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
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

module.exports = mongoose.model('Admin', adminSchema);