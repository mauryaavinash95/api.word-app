const { Save } = require("./schema/save");
const { getWord } = require('./getWord');

function saveWord(word, userId, isSaved) {
    return new Promise((resolve, reject) => {
        getWord(word, userId, 0)
            .then((result) => {
                let s = { word, userId, time: new Date() }
                if (isSaved === 0) {
                    Save.findOneAndUpdate({ userId, word }, s, { upsert: true })
                        .then((result) => {
                            console.log("Saved word successfully ");
                            resolve("Successfully added");
                        })
                        .catch((err) => {
                            console.log("Error: ", err);
                            reject(err);
                        })
                } else {
                    Save.remove({ userId, word })
                        .then((result) => {
                            console.log("Word deleted from save collection");
                            resolve("Successfully deleted");
                        })
                        .catch((err) => {
                            console.log("Error: ", err);
                            reject(err);
                        })
                }
            })
            .catch((err) => {
                reject(err);
            })


    })
}

module.exports = {
    saveWord
}