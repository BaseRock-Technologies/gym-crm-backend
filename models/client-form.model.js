const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const clientFormSchema = new Schema({
    date: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    documentName: {
        type: String,
        required: true,
    },
    documentPath: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ["personal-training", "trial-waiver", "physical-activity"],
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});


const clientFormModel = model('clientForms', clientFormSchema, 'clientForms');

module.exports = { clientFormModel };
