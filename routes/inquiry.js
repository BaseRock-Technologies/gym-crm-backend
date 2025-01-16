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

router.post('/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters } = req.body.myData;


        let records = await inquiryModel.find({ ...filters }, {
            firstName: 1,
            lastName: 1,
            contactNumber: 1,
            inquiryFor: 1,
            followUpDate: 1,
            attendedBy: 1,
            status: 1,
            convertibility: 1,
        })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        records = records.map(record => ({
            name: `${record.firstName} ${record.lastName}`,
            contactNumber: record.contactNumber,
            inquiryFor: record.inquiryFor,
            followUpDate: record.followUpDate,
            attendedBy: record.attendedBy,
            status: record.status,
            convertibility: record.convertibility,
            _id: record._id
        }));

        const total = await inquiryModel.countDocuments({});

        return res.send({
            status: 'success',
            data: {
                records,
                totalData: total,
            },
            message: 'Records fetched successfully'
        });
    } catch (error) {
        console.log("Error in auth route POST::/inquiry/records", error);
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
            employeeDetailsFromDB.push({ fullName: 'Admin' });
        }

        if (!employeeDetailsFromDB.includes(req.headers.userName)) {
            employeeDetailsFromDB.push({ fullName: req.headers.userName });
        }

        employeeDetailsFromDB = employeeDetailsFromDB.map(emp => ({ "fullName": emp.fullName }));
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