const Joi = require('joi');

const schema = Joi.object().keys({
    userId: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    access_token: [Joi.string(), Joi.number()],
    word: Joi.string(),
    email: Joi.string().email()
}).unknown();

module.exports = {
    schema,
}