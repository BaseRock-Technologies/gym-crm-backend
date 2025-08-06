const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const followupSchema = new Schema({
    clientName: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: Number,
    },
    followupType: {
        type: String,
    },
    followupDate: {
        type: Number,
        required: true,
    },
    followupTime: {
        type: String,
    },
    feedback: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'close'],
        default: 'pending',
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const followupsModel = model('followups', followupSchema, 'followups');

module.exports = { followupsModel };
