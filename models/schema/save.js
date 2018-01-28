var mongoose = require('mongoose');
var Save = mongoose.model('Save', {
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
    Save,
}