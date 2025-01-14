const express = require('express');
const { authenticate } = require('../helper/auth');
const { inquiryModel } = require('../models/inquiry.model');
const { groupTheArrayOn } = require('../helper/steroids');
const { clientSourceModel, employeeModel } = require('../models/others.model');
const { packageModel } = require('../models/package.model');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        data.createdBy = req.headers.userName,
            await inquiryModel.create(data);
        return res.send({ status: 'success', message: 'Inquiry Created successfully' });
    } catch (error) {
        console.log("Error in auth route POST::/inquiry/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/options', authenticate, async (req, res) => {
    try {
        let clientSourceDetails = await clientSourceModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });
        clientSourceDetails = groupTheArrayOn(clientSourceDetails);

        let packageDetails = await packageModel.find({ showOnWebsite: true }, { createdAt: 0, createdBy: 0, __v: 0, status: 0, showOnWebsite: 0 });
        packageDetails = groupTheArrayOn(packageDetails, "category");

        let employeeDetailsFromDB = await employeeModel.find({}, { fullName: 1 });
        if (!employeeDetailsFromDB.includes('Admin')) {
            employeeDetailsFromDB.push('Admin');
        }

        if (!employeeDetailsFromDB.includes(req.headers.userName)) {
            employeeDetailsFromDB.push(req.headers.userName);
        }

        employeeDetailsFromDB = employeeDetailsFromDB.map(emp => ({ "fullName": emp }));
        const employeeDetails = groupTheArrayOn(employeeDetailsFromDB);

        const data = {
            clientSourceDetails,
            packageDetails,
            employeeDetails
        }
        return res.send({ status: 'success', data, message: 'Fetched successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/inquiry/options", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;