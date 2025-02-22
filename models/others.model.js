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
    alternateContact: {
        type: Number,
    },
    clientCode: {
        type: String,
    },
    clientId: {
        type: Number,
    },
    createdBy: {
        type: String,
        required: true,
    },
    picture: {
        type: String
    },
    gender: {
        type: String,
    },
    birthday: {
        type: Number,
    },
    anniversary: {
        type: Number,
    },
    profession: {
        type: String,
    },
    address: {
        type: String,
    },
    remarks: {
        type: String,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const employeeSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
    },
    dateOfBirth: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["Male", "Female"]
    },
    address: {
        type: String,
    },
    employeeType: {
        type: String,
        enum: ["Sales Team", "Management", "Others"]
    },
    monthlySalary: {
        type: Number
    },
    maxDiscount: {
        type: Number
    },
    loginRequired: {
        type: Boolean,
        default: false,
    },
    setTraget: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"]
    },
    createdBy: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const clientSourceModel = model('clientSource', clientSourceSchema, 'clientSource');
const taxCategoryModel = model('taxCategory', taxSchema, 'taxCategory');
const paymentMethodModel = model('paymentMethods', paymentMethodSchema, 'paymentMethods');
const trainersModel = model('trainers', trainerSchema, 'trainers');
const clientModel = model('clients', clientSchema, 'clients');
const employeeModel = model('employees', employeeSchema, 'employees');

module.exports = { clientSourceModel, taxCategoryModel, paymentMethodModel, trainersModel, clientModel, employeeModel };
