const mongoose = require('mongoose');

function dbInit() {
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wordApp')
        .then((resolve) => {
            console.log("Connection with MongoDB server successful");
        }, (reject) => {
            console.log("Error connecting to MongoDB server: ", reject);
        });
}

module.exports = {
    dbInit, mongoose
}
