const express = require('express');
var cors = require('cors')
const moment = require('moment');
const bodyParser = require('body-parser');
const Joi = require('joi');
const dbWrapper = require("./db/dbWrapper");
const { userSignup } = require("./models/userSignup");
const { userLogin } = require("./models/userLogin");
const { validateUser } = require("./models/validateUser");
const { getWord } = require("./models/getWord");
const { saveWord } = require("./models/saveWord");
const { getHistory } = require('./models/getHistory');
const { getSaved } = require('./models/getSaved');

var app = express();
app.use(cors())
const port = process.env.PORT || 4000;
app.use(bodyParser.json());
dbWrapper.dbInit();

const paths = {
    find: "/find",
    login: "/login",
    signup: "/signup",
    save: "/save",
    history: "/history",
    favorites: "/favorites"
}

app.use((request, response, next) => {
    let requestUrl = request.path.toString();
    requestUrl = requestUrl.slice(1);
    let routes = Object.keys(paths);
    if (routes.includes(requestUrl) || request.path === "/") {
        next();
    } else {
        console.log("Path Not found");
        response.send({
            code: 400,
            result: "Path not found"
        })
    }
})

app.get("/", (request, response) => {
    let resp = {
        index: "get",
        login: "post",
        signup: "post",
        find: "post",
        save: "post",
        history: "post",
        favorites: "post"
    }
    response.send(resp);
})

app.post("/signup", (request, response) => {
    let { username, email, password } = request.body;
    if (username && email && password) {
        userSignup(username, email, password)
            .then((resolve) => {
                let { userId, token } = resolve;
                response.send({
                    code: 200,
                    message: { username, userId, token }
                });
            })
            .catch((err) => {
                response.send({
                    code: 404,
                    message: err.toString(),
                })
            })
    } else {
        response.send({
            code: 404,
            message: "username, email and password are required",
        })
    }
})

app.post("/login", (request, response) => {
    let { username, password } = request.body;
    if (username && password) {
        userLogin(username, password)
            .then((resolve) => {
                let { userId, token } = resolve;
                response.send({
                    code: 200,
                    message: { username, userId, token }
                });
            })
            .catch((err) => {
                response.send({
                    code: 404,
                    message: err.toString(),
                })
            })
    } else {
        response.send({
            code: 404,
            message: "username and password are required",
        })
    }
});

app.post("/find", (request, response) => {
    let { word, userId, token, save } = request.body;
    // console.log(`Got ${word}, ${userId}, ${token}`);
    validateUser(userId, token)
        .then((result) => {
            // console.log("Got this user");
            getWord(word, userId, save)
                .then((resp) => {
                    response.send(resp);
                })
                .catch((err) => {
                    response.send(err);
                });
        })
        .catch((err) => {
            // console.log("Error: ", err);
            response.send({
                code: 404,
                message: "No such user found!!"
            });
        })
})


app.post("/history", (request, response) => {
    let { userId, token } = request.body;
    validateUser(userId, token)
        .then((result) => {
            getHistory(userId)
                .then((resp) => {
                    response.send(resp);
                })
                .catch((err) => {
                    console.log("Error: ", err);
                    response.send(err);
                });
        })
        .catch((err) => {
            console.log("Outer catch has: ", err);
            response.send({
                code: 404,
                message: "No such user found!!"
            });
        })
})


app.post("/save", (request, response) => {
    let { word, userId, token, isSaved } = request.body;
    console.log("In save function: ", word, userId, token, isSaved);
    validateUser(userId, token)
        .then((result) => {
            saveWord(word, userId, isSaved)
                .then((resp) => {
                    // console.log("In index, got resp as ", resp);
                    response.send({
                        code: 200,
                        message: resp
                    });
                })
                .catch((err) => {
                    // console.log("In index, got error as: ", err);
                    response.send({
                        code: 404,
                        message: "Unable to save this word"
                    });
                });
        })
        .catch((err) => {
            response.send({
                code: 404,
                message: "No such user found!!"
            });
        })
});


app.post("/favorites", (request, response) => {
    let { userId, token } = request.body;
    validateUser(userId, token)
        .then((result) => {
            getSaved(userId)
                .then((resp) => {
                    response.send(resp);
                })
                .catch((err) => {
                    console.log("Error: ", err);
                    response.send(err);
                });
        })
        .catch((err) => {
            console.log("Outer catch has: ", err);
            response.send({
                code: 404,
                message: "No such user found!!"
            });
        })
})

app.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
})

