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
    },
    packageValidity: {
        type: Number,
    },
    packageSession: {
        type: Number,
    },
    packageClassType: {
        type: String,
    },
    maxDiscount: {
        type: Number,
    },
    status: {
        type: String,
    },
    createdBy: {
        type: String,
        required: true,
    },
    showOnWebsite: {
        type: Boolean,
        default: true,
    },

    category: {
        type: String,
        enum: ["GYM Packages", "PT Packages", "Group Class Packages"],
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const packageModel = model('packages', packageSchema, 'packages');


module.exports = { packageModel }