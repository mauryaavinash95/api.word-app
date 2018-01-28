const { Users } = require("./schema/users");

function validateUser(userId, token) {
    return new Promise((resolve, reject) => {
        // console.log("Finding: ", userId, token);
        Users.findOne({ userId, token })
            .then((result) => {
                // console.log("Got result : ", result);
                if (result) {
                    // console.log("In if result");
                    resolve("Found user");
                } else {
                    console.log("Rejecting");
                    reject("No such user");
                }
            })
            .catch((err) => {
                console.log("Got an error: ", err);
                reject(err);
            })
    })
}

module.exports = { validateUser }