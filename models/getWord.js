const request = require('request-promise');
const { Words } = require("./schema/words");
const { History } = require("./schema/history");
const { Save } = require("./schema/save");
// const { app_id, app_key } = require("../credentials/keys.json");
const app_id = process.env.app_id || require("../credentials/keys.json").app_id;
const app_key = process.env.app_key || require("../credentials/keys.json").app_key;

const { redisClient } = require("../db/dbWrapper");

const options = {
    uri: 'https://od-api.oxforddictionaries.com/api/v1/entries/en/',
    headers: {
        'app_id': app_id,
        'app_key': app_key
    },
    json: true, // Automatically parses the JSON string in the response
    transform2xxOnly: true
};

function getWord(word, userId, save = 1) {
    word = word.toLowerCase();
    var finalObj = {
        code: 404,
        message: "Word not found",
    }
    console.log("Got word as: ", word);
    return new Promise((resolve, reject) => {
        redisClient.hget("words", word)
            .then((res) => {
                if (res) {
                    finalObj.code = 200;
                    finalObj.message = JSON.parse(res);
                    finalObj.message.isSaved = 0;
                    resolve(finalObj);
                } else {
                    Words.find({ word: word })
                        .then((wordObject) => {
                            // console.log("In then: ", wordObject);
                            if (wordObject.length > 0) {
                                finalObj.code = 200;
                                finalObj.message = wordObject[0].toJSON();
                                finalObj.message.isSaved = 0;
                                _saveToRedis("words", word, finalObj.message);
                                Save.find({ userId, word })
                                    .then((savedResult) => {
                                        if (savedResult.length > 0) {
                                            finalObj.message.isSaved = 1;
                                        }
                                        resolve(finalObj);
                                    })
                                    .catch((err) => {
                                        console.log("Got error in save : ", err);
                                        resolve(finalObj);
                                    })
                                _saveHistory(word, userId, save);
                            } else {
                                // console.log("Word not found, going to call API");
                                _getWordFromApi(word)
                                    .then((fetchedWordObject) => {
                                        // console.log("obtained a result: ", fetchedWordObject);
                                        if (fetchedWordObject.results) {
                                            fetchedWordObject = fetchedWordObject.results[0];
                                            fetchedWordObject.isSaved = 0;

                                            Promise.all([_saveToDB(fetchedWordObject), _saveHistory(word, userId, save)])
                                                .then((promiseResult) => {
                                                    finalObj.code = 200;
                                                    finalObj.message = fetchedWordObject
                                                    resolve(finalObj);
                                                    console.log("All done now");
                                                })
                                                .catch((err) => {
                                                    console.log("Got Error: ");
                                                    finalObj.code = 404;
                                                    finalObj.message = JSON.stringify(err);
                                                    reject(finalObj);
                                                })

                                        } else {
                                            reject(finalObj)
                                        }
                                    })
                                    .catch((err) => {
                                        console.log("Error: ", err);
                                        reject(finalObj)
                                    });

                            }
                        })
                        .catch((err) => {
                            console.log("Word not found : ");
                            resolve(finalObj);
                        })
                }
            })
    });
}

function _saveHistory(word, userId, save) {
    return new Promise((resolve, reject) => {
        if (save === 1) {
            let h = { userId, word, time: new Date() };
            // Update time only if document exists, else insert it.
            History.findOneAndUpdate({ userId, word }, h, { upsert: true })
                .then((result) => {
                    console.log("Saved history successful");
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
        } else {
            resolve();
        }
    });
}

function _getWordFromApi(word) {
    console.log("API called");
    return new Promise((resolve, reject) => {
        let opts = Object.assign({}, options);
        opts.uri += encodeURI(word);
        request(opts)
            .then((responseJson) => {
                // console.log("Got reponse as : ", responseJson);
                resolve(responseJson);
            })
            .catch((err) => {
                // console.log("Error is: ", err);
                reject(err);
            })
    })
}

function _saveToDB(word) {
    let w = new Words(word);
    w.save()
        .then((resolve) => {
            console.log("Word saved to DB ");
        })
        .catch((err) => {
            console.log("Couldn't save to DB ", err);
        });
    _saveToRedis("words", word.word, word);
}

function _saveToRedis(hkey, key, value) {
    redisClient.hset(hkey, key, JSON.stringify(value))
        .then((resp) => {
            console.log("Saved in redis: ", resp);
        })
}


module.exports = {
    getWord
}
