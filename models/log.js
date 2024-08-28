const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    action: { type: String },
    type: { type: String, enum: ['Article', 'Quiz', 'Video', 'Project'] },
    content: { type: mongoose.Schema.Types.ObjectId, refPath: 'type' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Log', logSchema);