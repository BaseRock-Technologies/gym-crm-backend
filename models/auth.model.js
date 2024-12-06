const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const authSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    authToken: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, required: true, default: () => new Date() },
});

authSchema.index({ "createdAt": 1 }, { expireAfter: 120 })

const authModel = model('auth', authSchema, 'auth');


module.exports = { authModel };
