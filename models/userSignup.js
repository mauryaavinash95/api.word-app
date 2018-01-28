const { Users } = require("./schema/users");
const shortid = require("shortid");

function userSignup(username, email, password) {
    return new Promise((resolve, reject) => {
        let userId = shortid.generate();
        let token = shortid.generate();
        let u = new Users({
            userId,
            username,
            email,
            password,
            token,
            timeCreated: new Date(),
        })
        u.save()
            .then((result) => {
                resolve({ userId, token, username });
            })
            .catch((err) => {
                console.log("Error: ", err);
                reject("User with given email/username already exists");
            })
    });
}


module.exports = {
    userSignup
}