const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { clientSourceModel, taxCategoryModel, paymentMethodModel, trainersModel, clientModel } = require("../models/others.model");
const { groupTheArrayOn } = require('../helper/steroids');
const { packageModel } = require('../models/package.model');
const { clientMembershipModel, clientMembershipHistoryModel } = require('../models/membsrship.model');

router.post('/options', authenticate, async (req, res) => {
    try {
        let clientDetails = await clientModel.find({}, { email: 0, createdAt: 0, createdBy: 0, __v: 0 });
        clientDetails = clientDetails.reduce((acc, val) => { acc.default.push(val); return acc; }, { default: [] })
        const clientSourceDetails = await clientSourceModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });
        const paymentMethod = await paymentMethodModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });

        let packageDetails = await packageModel.find({ showOnWebsite: true, category: "GYM Packages" }, { createdAt: 0, createdBy: 0, __v: 0, status: 0, showOnWebsite: 0 });
        packageDetails = groupTheArrayOn(packageDetails, "category");
        let taxDetails = await taxCategoryModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });
        taxDetails = groupTheArrayOn(taxDetails, "category");

        const trainersDetails = await trainersModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });

        const groupedClientSourceDetails = groupTheArrayOn(clientSourceDetails);
        const groupedPaymentMethod = groupTheArrayOn(paymentMethod);
        const groupedTrainersDetails = groupTheArrayOn(trainersDetails);

        const billId = await clientMembershipModel.find({}).countDocuments();
        const data = {
            billId: billId + 1,
            clientDetails,
            clientSourceDetails: groupedClientSourceDetails,
            packageDetails,
            taxDetails,
            paymentMethod: groupedPaymentMethod,
            trainersDetails: groupedTrainersDetails,
        }
        return res.send({ status: 'success', data, message: 'Fetched successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/bills/options", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        data.createdBy = req.headers.userName;
        data.billType = data.billType;
        data.billId = await clientMembershipModel.countDocuments() + 1;
        // if (data.billType === "gym-membership") {
        const { clientName,
            contactNumber, memberId, picture = null } = data;
        await clientModel.updateOne({ contactNumber, clientName }, { $set: { memberId, picture } })
        // }
        await clientMembershipModel.create(data)

        const historyData = {
            memberId: data.memberId,
            billId: data.billId,
            billType: data.billType,
            freezeHistory: []
        }
        await clientMembershipHistoryModel.create(historyData);
        return res.send({ status: 'success', message: 'Bill Created successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/bills/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/details', authenticate, async (req, res) => {
    try {
        const { billId, billType } = req.body.myData;

        const existingBill = await clientMembershipModel
            .find({ memberId: billId, billType }, { createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, _id: 0, billType: 0 })
            .sort({ createdAt: -1 });


        if (!existingBill) {
            return res.send({ status: 'error', message: 'Data not found' });
        }

        return res.send({ status: 'success', data: existingBill[0], message: 'Bill fetched successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/bills/gym-bill/:id", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.patch('/update', authenticate, async (req, res) => {
    try {
        const { billId, billType } = req.body.myData;
        const data = req.body.myData;

        const existingBill = await clientMembershipModel.findOne({ memberId: billId, billType });
        if (!existingBill) {
            return res.send({ status: 'error', message: 'Data not found' });
        }

        const updateResult = await clientMembershipModel.updateOne({ memberId: billId, billType }, { $set: data });
        if (updateResult.nModified === 0) {
            return res.send({ status: 'error', message: 'No changes made to the bill' });
        }

        if (data.picture) {
            await clientModel.updateOne({ clientId: existingBill.clientId }, { $set: { picture: data.picture } });
        }

        return res.send({ status: 'success', message: 'Bill updated successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/bills/gym-bill/:id", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/membership/freeze', authenticate, async (req, res) => {
    try {
        const { billId, billType, daysAllotted } = req.body.myData;

        const isBillAvailable = await clientMembershipModel.findOne({ billId, billType });
        if (!isBillAvailable) {
            return res.send({ status: 'info', message: "No Bill found" });
        }

        const newEndDate = new Date(isBillAvailable.endDate * 1000);
        newEndDate.setDate(newEndDate.getDate() + daysAllotted);

        const newEndDateTimestamp = Math.floor(newEndDate.getTime() / 1000);
        await clientMembershipModel.updateOne({ billId, billType }, { $set: { endDate: newEndDateTimestamp } });

        const fromDate = isBillAvailable.joiningDate;

        await clientMembershipHistoryModel.updateOne(
            { billId, billType },
            { $push: { freezeHistory: { fromDate, endDate: newEndDateTimestamp, freezedBy: req.headers.userName, createdAt: Math.floor(new Date().getTime() / 1000) } } }
        );

        return res.send({ status: 'success', message: 'Freezed Successfully' });
    } catch (error) {
        console.log("Error in auth route::/bills/membership/freeze", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

module.exports = router;