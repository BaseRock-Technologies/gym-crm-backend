const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { clientSourceModel, taxCategoryModel, paymentMethodModel, trainersModel, clientModel } = require("../models/others.model");
const { groupTheArrayOn } = require('../helper/steroids');
const { packageModel } = require('../models/package.model');
const { clientMembershipModel } = require('../models/client.model');

router.post('/gym-bill', authenticate, async (req, res) => {
    try {
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

        const billId = await clientMembershipModel.find({ billType: "gym-membership" }).countDocuments();
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
        console.log("Error in auth route::/bills/gym-bill", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/gym-bill/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        delete data.authToken;
        data.createdBy = req.headers.userName;
        data.billType = "gym-membership";
        await clientMembershipModel.create(data)
        return res.send({ status: 'success', message: 'Bill Created successfully' });
    } catch (error) {
        console.log("Error in auth route::/bills/gym-bill/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;