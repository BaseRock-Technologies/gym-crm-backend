const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const inquirySchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    contactNumber: {
        type: Number,
        required: true,
    },
    alternateContact: {
        type: Number,
    },
    email: {
        type: String,
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female'],
        default: 'Male',
    },
    areaAddress: {
        type: String,
    },
    followupDate: {
        type: Number,
        required: true,
    },
    followupTime: {
        type: String,
    },
    assessmentDate: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['pending', 'close', 'completed'],
        default: 'pending',
        required: true,
    },
    attendedBy: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    convertibility: {
        type: String,
        enum: ['hot', 'cold', 'warm', 'expected-amount', 'successful-followup'],
        default: 'warm',
        required: true,
    },
    sourceOfInquiry: {
        type: String,
        required: true,
    },
    inquiryFor: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },
    sendTextEmail: {
        type: Boolean,
        default: false,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});


const inquiryModel = model('inquiries', inquirySchema, 'inquiries');

module.exports = { inquiryModel };
