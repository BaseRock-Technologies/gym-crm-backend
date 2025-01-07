const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientSourceModel, paymentMethodModel, taxCategoryModel } = require('../models/others.model');

const router = express.Router();


router.post('/client-source/create', authenticate, async (req, res) => {
    try {
        const { clientSource } = req.body.myData;

        const existingSource = await clientSourceModel.findOne({ clientSource });
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Client Source Already Exists" });
        }

        const data = {
            clientSource,
            createdBy: req.headers.userName,
        };
        await clientSourceModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'CLient Source Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/client-source/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/payment-method/create', authenticate, async (req, res) => {
    try {
        const { method } = req.body.myData;

        const existingSource = await paymentMethodModel.findOne({ method });
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Payment Method Already Exists" });
        }

        const data = {
            method,
            createdBy: req.headers.userName,
        };
        await paymentMethodModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Payment Method Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/payment-method/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/tax/create', authenticate, async (req, res) => {
    try {
        const { taxName, chargesPercentage, category } = req.body.myData;

        const existingSource = await taxCategoryModel.findOne({ taxName });
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Tax Already Exists" });
        }

        const data = {
            taxName,
            chargesPercentage,
            category,
            createdBy: req.headers.userName,
        };
        await taxCategoryModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Tax Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/tax/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

module.exports = router;