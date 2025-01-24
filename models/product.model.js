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
        type: Number,
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

const productModel = model('products', productSchema, 'products');


module.exports = { productModel }