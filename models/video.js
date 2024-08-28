const video = require('mongoose');

const videoSchema = new video.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
    }
}, {
    timestamps: true
});

module.exports = video.model('Video', videoSchema);