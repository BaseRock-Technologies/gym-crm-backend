const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const adminSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },

    hash: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});


const adminModel = model('admin', adminSchema, 'admin');

module.exports = { adminModel };
