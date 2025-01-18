const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const attendanceSchema = new Schema({
    biometricId: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    memberId: {
        type: Number,
        required: true,
    },
    contactNumber: {
        type: Number,
        required: true,
    },
    inTime: {
        type: Number,
    },
    outTime: {
        type: Number,
    },
    category: {
        type: String,
        required: true,
        enum: ["clients", "trainers", "employees"]
    },
    date: {
        type: Number,
        default: () => Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    },
    createdAt: { type: Number, default: () => Math.floor(new Date() / 1000) },
});


const attendanceModel = model('attendance', attendanceSchema, 'attendance');

module.exports = { attendanceModel };
