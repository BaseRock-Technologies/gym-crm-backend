const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const posBillSchema = new Schema({
    invoiceNo: {
        type: Number,
        required: true,
    },
    billDate: {
        type: Number,
        required: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    subTotal: {
        type: Number,
    },
    products: {
        type: Array
    },
    discount: {
        type: Number,
    },
    misc: {
        type: Number,
    },
    taxName: {
        type: String,
    },
    totalAmount: {
        type: Number,
    },
    amountPaid: {
        type: Number,
    },
    paymentMethod: {
        type: String,
    },
    pendingPayment: {
        type: Number
    },
    notes: {
        type: String,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const posBill = model('posBills', posBillSchema, 'posBills');


module.exports = { posBill }