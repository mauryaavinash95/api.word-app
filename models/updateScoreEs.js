const dbWrapper = require('../db/dbWrapper');
const elasticsearch = require('elasticsearch');
const async = require('async');

function updateScoreEs(word) {
    dbWrapper.elasticClient.update({
        index: "dictionary",
        type: "words",
        id: encodeURIComponent(word.toString()),
        body: {
            script: {
                "source": "ctx._source.word.weight++",
                "lang": "painless"
            }
        }
    })
        .then((response) => {
            console.log("Update successfully score: ", encodeURIComponent(word.toString()));
        })
        .catch((err) => {
            console.log("Error while updating score: ", err);
        })
}

module.exports = {
    updateScoreEs
}

// , function (err, res) {
//     if (err) {
//         console.log("Error while updating score: ", err);
//     } else {
//         // console.log("Update successfully score: ", res);
//     }
// }