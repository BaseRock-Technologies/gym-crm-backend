const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const feedbackSchema = new Schema({
    clientName: {
        type: String,
    },
    contactNumber: {
        type: Number,
    },
    feedback: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});


const feedbackModel = model('feedback', feedbackSchema, 'feedback');

module.exports = { feedbackModel };
