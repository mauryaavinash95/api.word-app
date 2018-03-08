const { Subscription } = require("./schema/subscription");

function saveSubscription(userId, token, subscription) {
    console.log("In saveSubscription: ", userId, token, subscription);
    return new Promise((resolve, reject) => {
        let s = new Subscription({
            _id: userId,
            userId,
            token,
            subscription
        });
        Subscription.findOneAndUpdate({ userId }, s, { upsert: true })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            })

    })

}

module.exports = {
    saveSubscription
}