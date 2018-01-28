const { History } = require("./schema/history");
const { Save } = require("./schema/save");
const async = require('async');

function getHistory(userId) {
    var finalObj = {
        code: 404,
        message: "No Words found",
    }
    return new Promise((resolve, reject) => {
        console.log("Inside getHistory");
        Promise.all([History.find({ userId }, null, { sort: { time: -1 } }), Save.find({ userId }).select("word -_id")])
            .then((results) => {
                let historyArr = results[0];
                let saveArr = results[1];
                let finalArr = [];
                let saveWordArr = [];

                saveArr.forEach((saveElement) => {
                    saveWordArr.push(saveElement.word);
                });

                historyArr.forEach((historyElement) => {
                    let tempElement = historyElement.toJSON();
                    if (saveWordArr.includes(tempElement.word)) {
                        tempElement.isSaved = 1;
                    } else {
                        tempElement.isSaved = 0;
                    }
                    finalArr.push(tempElement);
                });


                finalObj.code = 200;
                finalObj.message = finalArr;
                resolve(finalObj);
            })
            .catch((err) => {
                finalObj.code = 404;
                finalObj.message = [];
                reject(err);
            })
    })
}

module.exports = {
    getHistory
}