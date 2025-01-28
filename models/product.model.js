const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const productSchema = new Schema({
    productName: {
        type: String,
        required: true,
    },
    productImage: {
        type: Buffer
    },
    productMrp: {
        type: Number,
        required: true,
    },
    productMrpImage: {
        type: Buffer
    },
    productSalesPrice: {
        type: Number,
        required: true,
    },
    productSalesImage: {
        type: Buffer
    },
    productBarcode: {
        type: String,
        required: true,
    },
    productBarcodeImage: {
        type: Buffer
    },
    description: {
        type: String,
    },
    manageInventory: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const vendorSchema = new Schema({
    vendorName: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    gstNumber: {
        type: Number,
        required: true,
    },
    companyDetails: {
        type: String
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },

})

const productModel = model('products', productSchema, 'products');
const vendorModel = model('vendors', vendorSchema, 'vendors');


module.exports = { productModel, vendorModel }