const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const clientSchema = new Schema({
    // personal info
    memberId: {
        type: Number,
        required: true,
    },
    invoiceDate: {
        type: String,
        required: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: Number,
        required: true,
    },
    alternateContactNumber: {
        type: Number,
    },
    email: {
        type: String,
    },
    clientSource: {
        type: Schema.Types.ObjectId,
        ref: 'ClientSource',
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
    taxId: {
        type: String,
    },
    workoutHours: {
        type: [String],
    },
    address: {
        type: String,
    },
    remarks: {
        type: String,
    },
    picture: {
        type: Buffer,
    },

    // package Info
    package: {
        type: Schema.Types.ObjectId,
        ref: 'packageCategory',
    },
    joiningDate: {
        type: Number,
        required: true,
    },
    endDate: {
        type: Number,
        required: true,
    },
    discountPercentage: {
        type: Number,
    },
    discountPrice: {
        type: Number,
    },
    admissionCharges: {
        type: Number,
    },
    tax: {
        type: Schema.Types.ObjectId,
        ref: 'taxCategory',
    },
    amountPayable: {
        type: Number,
    },
    amountPaid: {
        type: Number,
    },
    paymentMethod: {
        type: Schema.Types.ObjectId,
        ref: 'paymentMethods',
    },
    amountBalance: {
        type: Number,
    },
    clientRepresentative: {
        type: String,
        required: true,
    },
    trainer: {
        type: Schema.Types.ObjectId,
        ref: 'trainers',
    },
    sendTextAndEmail: {
        type: Boolean,
        default: false,
    },
    sendWhatsapp: {
        type: Boolean,
        default: false,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});


const clientModel = model('clients', clientSchema, 'clients');

module.exports = { clientModel };
