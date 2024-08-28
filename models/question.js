const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
    correctAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema)