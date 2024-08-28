const mongoose = require('mongoose');

const questInstanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
    completed: { type: Boolean, default: false },
    contentBreakdown: [{
        type: { type: String, enum: ['Article', 'Quiz', 'Video', 'Project'] },
        id: { type: mongoose.Schema.Types.ObjectId, refPath: 'type' },
        progress: { type: Number, default: 0 }, // progress from 0 - 1
        completed: { type: Boolean, default: false },
        attempts: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        score: { type: Number, default: 0 }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('QuestInstance', questInstanceSchema)