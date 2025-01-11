const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { clientSourceModel, taxCategoryModel, paymentMethodModel, trainersModel, clientModel } = require("../models/others.model");
const { groupTheArrayOn } = require('../helper/steroids');
const { packageModel } = require('../models/package.model');
const { clientMembershipModel } = require('../models/client.model');

router.post('/options', authenticate, async (req, res) => {
    try {
        const { billType } = req.body.myData;
        let clientDetails = await clientModel.find({}, { email: 0, createdAt: 0, createdBy: 0, __v: 0 });
        clientDetails = clientDetails.reduce((acc, val) => { acc.default.push(val); return acc; }, { default: [] })
        const clientSourceDetails = await clientSourceModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });
        const paymentMethod = await paymentMethodModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });

        let packageDetails = await packageModel.find({ showOnWebsite: true }, { createdAt: 0, createdBy: 0, __v: 0, status: 0, showOnWebsite: 0 });
        packageDetails = groupTheArrayOn(packageDetails, "category");
        let taxDetails = await taxCategoryModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });
        taxDetails = groupTheArrayOn(taxDetails, "category");

        const trainersDetails = await trainersModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });

        const groupedClientSourceDetails = groupTheArrayOn(clientSourceDetails);
        const groupedPaymentMethod = groupTheArrayOn(paymentMethod);
        const groupedTrainersDetails = groupTheArrayOn(trainersDetails);

        const billId = await clientMembershipModel.find({ billType }).countDocuments();
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
        if (data.billType === "gym-membership") {
            const { clientName,
                contactNumber, memberId } = data;
            await clientModel.updateOne({ contactNumber, clientName }, { $set: { memberId } })
        }
        await clientMembershipModel.create(data)
        return res.send({ status: 'success', message: 'Bill Created successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/bills/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/details', authenticate, async (req, res) => {
    try {
        const { billId, billType } = req.body.myData;

        const existingBill = await clientMembershipModel.find({ memberId: billId, billType }, { createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, _id: 0, billType: 0 });
        if (!existingBill) {
            return res.status(404).send({ status: 'error', message: 'Data not found' });
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
            return res.status(404).send({ status: 'error', message: 'Data not found' });
        }

        const updateResult = await clientMembershipModel.updateOne({ memberId: billId, billType }, { $set: data });
        console.log(updateResult)
        if (updateResult.nModified === 0) {
            return res.status(400).send({ status: 'error', message: 'No changes made to the bill' });
        }

        return res.send({ status: 'success', message: 'Bill updated successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/bills/gym-bill/:id", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;