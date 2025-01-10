const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const clientMembership = new Schema({
    // personal info
    memberId: {
        type: Number,
        required: true,
    },
    invoiceDate: {
        type: String,
    },
    clientName: {
        type: String,
        required: true,
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
    clientSource: {
        type: String,
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
        type: Number,
    },
    workoutHours: {
        morning: {
            type: String,
        },
        evening: {
            type: String,
        },
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
    packageName: {
        type: String,
    },
    packagePrice: {
        type: Number,
    },

    joiningDate: {
        type: Number,
    },
    endDate: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    discountAmount: {
        type: Number,
    },
    admissionCharges: {
        type: Number,
    },
    taxName: {
        type: String,

    },
    amountPayable: {
        type: Number,
    },
    amountPaid: {
        type: Number,
    },
    paymentMode: {
        type: String,

    },
    balanceAmount: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    followUpDate: {
        type: String,
    },
    amountStatus: {
        type: String,
    },
    paymentMethodDetail: {
        type: String,
    },
    clientRepresentative: {
        type: String,
    },
    trainer: {
        type: String,
    },
    sendTextAndEmail: {
        type: Boolean,
        default: false,
    },
    sendWhatsapp: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: String,
        required: true,
    },
    billType: {
        type: String,
        required: true,
        enum: ['gym-membership', 'personal-training', 'group-class'],
    },
    chequeNumber: {
        type: String,
    },
    chequeDate: {
        type: String,
    },
    chequeDate: {
        type: String,
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});


const clientMembershipModel = model('memberships', clientMembership, 'memberships');

module.exports = { clientMembershipModel };
