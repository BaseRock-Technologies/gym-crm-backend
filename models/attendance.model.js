const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const clientAttendanceSchema = new Schema({
    clientId: {
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
        default: "clients"
    },
    date: {
        type: Number,
        default: () => Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    },
    createdAt: { type: Number, default: () => Math.floor(new Date() / 1000) },
});

const employeeAttendanceSchema = new Schema({
    employeeId: {
        type: Number,
        required: true,
    },
    employeeName: {
        type: String,
        required: true,
    },
    employeeNumber: {
        type: Number,
        required: true,
    },
    employeeEmail: {
        type: String,
    },
    employeeDesignation: {
        type: String,
    },
    employeeSalary: {
        type: Number,
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
        enum: ["trainers", "employees"]
    },
    date: {
        type: Number,
        default: () => Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    },
    createdAt: { type: Number, default: () => Math.floor(new Date() / 1000) },
});


const clientAttendanceModel = model('clientAttendance', clientAttendanceSchema, 'clientAttendance');
const employeeAttendanceModel = model('employeeAttendance', employeeAttendanceSchema, 'employeeAttendance');

module.exports = { clientAttendanceModel, employeeAttendanceModel };
