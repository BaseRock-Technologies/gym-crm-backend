const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const clientSourceSchema = new Schema({
    source: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const packageSchema = new Schema({
    package: {
        type: String,
        required: true,
    },
    price: {
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

const taxSchema = new Schema({
    taxName: {
        type: String,
        required: true,
    },
    chargesPercentage: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const paymentMethodSchema = new Schema({
    method: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const trainerSchema = new Schema({
    trainerName: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});



const clientSourceModel = model('clientSource', clientSourceSchema, 'clientSource');
const packageModel = model('packageCategory', packageSchema, 'packageCategory');
const taxCategoryModel = model('taxCategory', taxSchema, 'taxCategory');
const paymentMethodModel = model('paymentMethods', paymentMethodSchema, 'paymentMethods');
const trainersModel = model('trainers', trainerSchema, 'trainers');



module.exports = { clientSourceModel, packageModel, taxCategoryModel, paymentMethodModel, trainersModel };
