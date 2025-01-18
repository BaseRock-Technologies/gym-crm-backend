const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const feedbackSchema = new Schema({
    date: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: Number,
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});


const feedbackModel = model('feedback', feedbackSchema, 'feedback');

module.exports = { feedbackModel };
