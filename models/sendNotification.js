
const webpush = require('web-push');
const vapidKeys = require('../credentials/vapidAuth.json');
const { Subscription } = require("./schema/subscription");

function sendNotification(userId, word, meaning) {
    console.log("In sendNotification function");
    webpush.setVapidDetails('mailto:dummyemail@gmail.com', vapidKeys.public, vapidKeys.private);
    Subscription.findOne({ userId })
        .then((res) => {
            console.log("Found the subscription of this user in database: ", res);
            if (res) {
                let pushConfig = {
                    endpoint: res.subscription.endpoint,
                    keys: {
                        auth: res.subscription.keys.auth,
                        p256dh: res.subscription.keys.p256dh
                    }
                }
                webpush.sendNotification(pushConfig, JSON.stringify({ title: word, content: "Meaning Found", openUrl: "/" }))
                    .then((res) => {
                        console.log("Webpush has sent the request for : ", word);
                    })
                    .catch((err) => {
                        console.log("Webpush has error: ", err);
                    })
            }
        })
}


module.exports = {
    sendNotification
}