const mongoose = require('mongoose');
var redis = require("redis");
const { promisify } = require('util');
const mongoAuth = require("../credentials/mongoAuth.json");
const bonsaiAuth = require('../credentials/bonsaiAuth.json');
const redisAuth = require("../credentials/redisAuth.json");
const elasticsearch = require('elasticsearch');

var redisClient = {};

var elasticClient = new elasticsearch.Client({
    hosts: [
        bonsaiAuth.url
    ],
    httpAuth: (bonsaiAuth.username + ":" + bonsaiAuth.password).toString()
});

function dbInit() {
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI || "mongodb://" + mongoAuth.username + ":" + mongoAuth.password + "@" + mongoAuth.url || 'mongodb://localhost:27017/wordApp')
        .then((resolve) => {
            console.log("Connection with MongoDB server successful");
        }, (reject) => {
            console.log("Error connecting to MongoDB server: ", reject);
        })
        .catch((err) => {
            console.log("Error caught: ", err);
        });

    elasticClient.ping({
        requestTimeout: 0,
    }, function (error) {
        if (error) {
            console.error('Elasticsearch cluster is down!');
        } else {
            console.log('All is well on elastic server');
        }
    });

    let client = redis.createClient(redisAuth);
    redisClient.get = promisify(client.get).bind(client);
    redisClient.set = promisify(client.set).bind(client);
    redisClient.hget = promisify(client.hget).bind(client);
    redisClient.hset = promisify(client.hset).bind(client);
    redisClient.hmset = promisify(client.hmset).bind(client);
    redisClient.hmget = promisify(client.hmget).bind(client);
}

module.exports = {
    dbInit, mongoose, redisClient, elasticClient
}
