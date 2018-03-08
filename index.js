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
const { getSuggestions } = require('./models/getSuggestion');
const { updateScoreEs } = require('./models/updateScoreEs');
const { saveSubscription } = require('./models/saveSubscription');
const { sendNotification } = require('./models/sendNotification');

var app = express();
app.use(cors({ origin: true }))
const port = process.env.PORT || 4000;
app.use(bodyParser.json());
dbWrapper.dbInit();

const paths = {
    find: "/find",
    login: "/login",
    signup: "/signup",
    save: "/save",
    history: "/history",
    favorites: "/favorites",
    suggest: "/suggest",
    newsubscription: "/newsubscription"
}

// app.use((request, response, next) => {
//     let requestUrl = request.path.toString();
//     requestUrl = requestUrl.slice(1);
//     let routes = Object.keys(paths);
//     console.log("Paths: ", routes);
//     if (routes.includes(requestUrl) || request.path === "/") {
//         next();
//     } else {
//         console.log("Path Not found");
//         response.send({
//             code: 400,
//             result: "Path not found"
//         })
//     }
// })

app.get("/", (request, response) => {
    let resp = {
        index: "get",
        login: "post",
        signup: "post",
        find: "post",
        save: "post",
        history: "post",
        favorites: "post",
        suggest: "get",
        newsubscription: "post"
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
                    sendNotification(userId, word, resp);
                    response.send(resp);
                    if (resp.code === 200) {
                        updateScoreEs(word);
                    }
                })
                .catch((err) => {
                    response.send(err);
                });
        })
        .catch((err) => {
            console.log("Error: ", err);
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
            return getSaved(userId);
        })
        .then((resp) => {
            response.send(resp);
        })
        .catch((err) => {
            console.log("Outer catch has: ", err);
            response.send({
                code: 404,
                message: "No such user found!!"
            });
        })
})

app.get("/suggest/:word", (request, response) => {
    let word = request.params.word;
    getSuggestions(word)
        .then((resolve) => {
            response.send({
                code: 200,
                message: resolve
            });
        })
        .catch((err) => {
            console.log("Error is: ", err);
            response.send({
                code: 400,
                message: "Got some error",
            })
        })
})

app.post('/newsubscription', (request, response) => {
    let { userId, token, subscriptiondata } = request.body;
    // console.log("Request body is: ", request.body)
    validateUser(userId, token)
        .then((response) => {
            return saveSubscription(userId, token, subscriptiondata)
        })
        .then((res) => {
            response.send({
                code: 200,
                message: "Subscription saved successfully"
            })
        })
        .catch((err) => {
            console.log("Error is in newsubscription route: ", err);
            response.send({
                code: 400,
                message: "Got some error",
            })
        })
})

app.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
})

