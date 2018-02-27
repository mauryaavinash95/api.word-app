const dbWrapper = require('../db/dbWrapper');

function getSuggestions(word = null) {
    return new Promise((resolve, reject) => {
        if (word) {
            console.log("Got word");
            dbWrapper.elasticClient.search({
                index: 'dictionary',
                type: 'words',
                body: {
                    suggest: {
                        wordSuggestion: {
                            prefix: word,
                            completion: {
                                field: "word"
                            }
                        }
                    }
                }
            })
                .then((responseJson) => {
                    // console.log("Response is: ");
                    // console.log(JSON.stringify(responseJson.suggest.wordSuggestion[0].options, undefined, 2));
                    let words = [];
                    responseJson.suggest.wordSuggestion[0].options.forEach(element => {
                        words.push(element._source.word.input);
                    });
                    resolve(words);
                })
        } else {
            reject("Please send a valid word");
        }
    })

}

module.exports = {
    getSuggestions
}