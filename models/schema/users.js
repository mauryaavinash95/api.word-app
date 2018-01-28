var mongoose = require('mongoose');
var Users = mongoose.model('Users', {
    userId: {
        required: true,
        type: String,
        trim: true,
    },
    username: {
        required: true,
        type: String,
        trim: true,
        index: { unique: true },
    },
    email: {
        required: true,
        type: String,
        trim: true,
        index: { unique: true },
    },
    password: {
        required: true,
        type: String,
        trim: true,
    },
    token: {
        required: true,
        type: String,
        trim: true,
    },
    timeCreated: {
        required: true,
        trim: true,
        type: Date,
    }
});

module.exports = {
    Users,
}