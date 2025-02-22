const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientSourceModel, paymentMethodModel, taxCategoryModel, trainersModel, employeeModel } = require('../models/others.model');

const router = express.Router();


router.post('/client-source/create', authenticate, async (req, res) => {
    try {
        const { clientSource } = req.body.myData;

        const existingSource = await clientSourceModel.findOne({ clientSource }).lean();
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Client Source Already Exists" });
        }

        const data = {
            clientSource,
            createdBy: req.headers.userName,
        };
        await clientSourceModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Client Source Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/client-source/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/trainer/create', authenticate, async (req, res) => {
    try {
        const { trainer } = req.body.myData;

        const existingSource = await trainersModel.findOne({ trainer }).lean();
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Trainer Already Exists" });
        }

        const data = {
            trainer,
            createdBy: req.headers.userName,
        };
        await trainersModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Trainer Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/trainer/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/payment-method/create', authenticate, async (req, res) => {
    try {
        const { paymentMode } = req.body.myData;

        const existingSource = await paymentMethodModel.findOne({ paymentMode }).lean();
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Payment Method Already Exists" });
        }

        const data = {
            paymentMode,
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

        const existingSource = await taxCategoryModel.findOne({ taxName, category }).lean();
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

router.post('/employee/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;

        const existingEmployee = await employeeModel.findOne({ fullName: data.fullName, contact: data.contact, gender: data.gender }).lean();
        if (existingEmployee) {
            return res.send({ status: 'info', exists: true, message: "Employee Already Exists" });
        }
        data.createdBy = req.headers.userName;
        await employeeModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Employee Created successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/employee/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

module.exports = router;