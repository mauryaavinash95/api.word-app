const { Users } = require("./schema/users");

function userLogin(username, password) {
    return new Promise((resolve, reject) => {
        Users.findOne({ username, password })
            .then((results) => {
                console.log("in userLogin: ", results);
                if (results) {
                    resolve(results);
                } else {
                    reject("Invalid credentials");
                }
            })
            .catch((err) => {
                reject("Invalid credentials");
            })
    })
}

module.exports = {
    userLogin
}