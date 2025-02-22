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

const resetTokenSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    resetToken: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, required: true, default: () => new Date() },
});

// authSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 360000 })
// resetTokenSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 360000 })

const authModel = model('auth', authSchema, 'auth');
const resetTokenModel = model('resetTokens', resetTokenSchema, 'resetTokens');


module.exports = { authModel, resetTokenModel };
