const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const packageSchema = new Schema({
    package: {
        type: String,
        required: true,
    },
    packagePrice: {
        type: Number,
        required: true,
    },
    durationInDays: {
        type: Number,
        required: true,
    },
    maxDiscount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    showOnWebsite: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const packageModel = model('packages', packageSchema, 'packages');


module.exports = { packageModel }