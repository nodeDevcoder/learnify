const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    timeLimit: { type: Number },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema)