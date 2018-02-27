const auth = require('../credentials/bonsaiAuth.json');
const words = require('./10Kwords.json');
const request = require('request-promise');
const elasticsearch = require('elasticsearch');
const async = require('async');

let uri = ("https://" + auth.username + ":" + auth.password + "@" + auth.url).toString();

var client = new elasticsearch.Client({
    hosts: [
        auth.url
    ],
    httpAuth: (auth.username + ":" + auth.password).toString()
});

// Checking if elastic is alive;.
client.ping({
    requestTimeout: 0,
}, function (error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('All is well on elastic server');
    }
});


let wordKeys = words;
let bulkQuery = [];
let headerData, data;
let maxWords = 100;
let bulkWords = [];
let wordArr = [];
for (let i = 0; i < wordKeys.length; i += maxWords) {
    let tempArr = []
    for (let j = i; j < maxWords + i; j++) {
        tempArr.push(wordKeys[j]);
    }
    bulkWords.push(tempArr);
}

async.eachOfLimit(bulkWords, 1, (tempArr, index, cb) => {
    let query = []
    console.log("Starting to write: ", index, tempArr.length, tempArr[0]);
    tempArr.forEach((word, i) => {
        headerData = {
            index: {
                "_index": 'dictionary',
                "_type": 'words',
                "_id": encodeURIComponent(word.toString())
            }
        }
        query.push(headerData);

        data = {
            word: {
                input: word,
                weight: 1,
            }
        }
        query.push(data);
    })
    writeToEs(query)
        .then((resolve) => {
            console.log("Written: ", index);
            cb();
        })
        .catch((err) => {
            console.log("Error: ", err);
            cb();
        })
}, (err) => {
    console.log("Error got is: ", err);
    process.exit(0);
})

function writeToEs(bulkArr) {
    // console.log(`----------------> Writing ${bulkArr.length}`);
    return new Promise((resolve, reject) => {
        client.bulk({
            maxRetries: 5,
            index: 'dictionary',
            type: 'words',
            body: bulkArr
        }, function (err, resp, status) {
            if (err) {
                console.log("Got err: ", err);
                reject(err);
            }
            else {
                console.log("[ES]: Written");
                resolve(resp.items);

            }
        })
    })
}