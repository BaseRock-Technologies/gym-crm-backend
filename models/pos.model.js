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
    productDetails: {
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

const posPurchaseSchema = new Schema({
    vendorName: {
        type: String,
        required: true,
    },
    invoiceByVendor: {
        type: Number,
        required: true,
    },
    purchaseDate: {
        type: Number,
        required: true,
    },
    productDetails: {
        type: Array
    },
    subTotal: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    taxName: {
        type: String,
    },
    misc: {
        type: Number,
    },
    shippingCharges: {
        type: Number,
    },
    totalCharges: {
        type: Number,
    },
    amountPaid: {
        type: Number,
    },
    paymentMode: {
        type: String,
    },
    credit: {
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
const posPurchase = model('posPurchases', posPurchaseSchema, 'posPurchases');


module.exports = { posBill, posPurchase }