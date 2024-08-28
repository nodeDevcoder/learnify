const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['CS', 'ENG', 'MED', 'MAT']
    },
    gradeLevel: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Inactive'
    },
    content: [{
        type: {
            type: String,
            required: true,
            enum: ['Article', 'Quiz', 'Video', 'Project']
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'content.type'
        }
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    private: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Quest', questSchema);