var mongoose = require('mongoose');
var Subscription = mongoose.model('Subscription', {
    _id: {
        required: true,
        type: String,
        trim: true,
    },
    userId: {
        required: true,
        type: String,
        trim: true,
    },
    token: {
        required: true,
        type: String,
        trim: true,
    },
    subscription: {
        required: true,
        type: Object,
        trim: true,
    }
});

module.exports = {
    Subscription,
}