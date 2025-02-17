const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const clientMembership = new Schema({
    // personal info
    memberId: {
        type: Number,
        required: true,
    },
    billId: {
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
    clientCode: {
        type: String
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
        type: String,
    },
    workoutHourmorning: {
        type: String,
    },

    workoutHourevening: {
        type: String,
    },
    address: {
        type: String,
    },
    remarks: {
        type: String,
    },
    picture: {
        type: String,
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
    sessions: {
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
    status: {
        type: String,
        enum: ['active', 'deleted', 'freezed', 'inactive'],
        default: 'active'
    },
    createdAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(new Date().getTime() / 1000) },
});

const clientMembershipHistory = new Schema({
    memberId: {
        type: Number,
        required: true,
    },
    billId: {
        type: Number,
        required: true,
    },
    billType: {
        type: String,
        required: true,
        enum: ['gym-membership', 'personal-training', 'group-class'],
    },
    freezeHistory: {
        type: Array
    }
})


const clientMembershipModel = model('memberships', clientMembership, 'memberships');
const clientMembershipHistoryModel = model('membershipHistory', clientMembershipHistory, 'membershipHistory');

module.exports = { clientMembershipModel, clientMembershipHistoryModel };
