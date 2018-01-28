var mongoose = require('mongoose');
var Words = mongoose.model('Words', {
    id: {
        required: true,
        type: String,
        trim: true,
    },
    language: {
        required: true,
        type: String,
        trim: true,
    },
    lexicalEntries: {
        required: true,
        type: Array,
        trim: true,
    },
    type: {
        required: true,
        type: String,
        trim: true,
    },
    word: {
        required: true,
        type: String,
        trim: true,
    },
});

module.exports = {
    Words,
}