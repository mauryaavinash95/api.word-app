const { History } = require("./schema/history");
const { Save } = require("./schema/save");
const async = require('async');

function getSaved(userId) {
    var finalObj = {
        code: 404,
        message: "No Words found",
    }
    return new Promise((resolve, reject) => {
        console.log("Inside getSaved");
        Save.find({ userId }).select("word -_id")
            .then((results) => {
                let saveArr = results;
                let finalArr = [];

                saveArr.forEach((saveElement) => {
                    let tempElement = saveElement.toJSON();
                    tempElement.isSaved = 1;
                    finalArr.push(tempElement);
                });
                // console.log("Final Arr is: ", finalArr);
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
    getSaved
}