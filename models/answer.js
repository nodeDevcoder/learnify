const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Answer', answerSchema)