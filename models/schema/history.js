var mongoose = require('mongoose');
var History = mongoose.model('History', {
    userId: {
        required: true,
        type: String,
        trim: true,
    },
    word: {
        required: true,
        type: String,
        trim: true,
    },
    time: {
        required: true,
        trim: true,
        type: Date,
    }
});

module.exports = {
    History,
}