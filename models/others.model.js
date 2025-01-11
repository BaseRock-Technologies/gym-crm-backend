const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const clientSourceSchema = new Schema({
    clientSource: {
        type: String,
        required: true,
    },
    createdBy: {
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
    paymentMode: {
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
    trainer: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const clientSchema = new Schema({
    clientName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    contactNumber: {
        type: Number,
        required: true,
    },
    memberId: {
        type: Number,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});



const clientSourceModel = model('clientSource', clientSourceSchema, 'clientSource');
const taxCategoryModel = model('taxCategory', taxSchema, 'taxCategory');
const paymentMethodModel = model('paymentMethods', paymentMethodSchema, 'paymentMethods');
const trainersModel = model('trainers', trainerSchema, 'trainers');
const clientModel = model('clients', clientSchema, 'clients');



module.exports = { clientSourceModel, taxCategoryModel, paymentMethodModel, trainersModel, clientModel };
