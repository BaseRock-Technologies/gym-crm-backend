const express = require('express');
const { authenticate } = require('../helper/auth');
const { inquiryModel } = require('../models/inquiry.model');
const { groupTheArrayOn, formatTimestamp } = require('../helper/steroids');
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

        const { filters, searchConfig } = req.body.myData;
        const cleanFilters = { ...filters };

        // Handle date range
        if (filters && filters['date-range']) {
            const { from, to } = filters['date-range'];
            cleanFilters.followUpDate = {
                $gte: new Date(from).getTime() / 1000,
                $lte: new Date(to).getTime() / 1000
            };
            delete cleanFilters['date-range'];
        }

        let searchQuery = cleanFilters;

        if (searchConfig && searchConfig.searchTerm && searchConfig.searchableColumns?.length) {
            const searchTerm = searchConfig.searchTerm.trim();
            const searchConditions = searchConfig.searchableColumns.flatMap(column => {
                if (column === 'name') {
                    return [
                        { firstName: { $regex: searchTerm, $options: 'i' } },
                        { lastName: { $regex: searchTerm, $options: 'i' } }
                    ];
                }

                if (column === 'contactNumber') {
                    return !isNaN(searchTerm)
                        ? [{ contactNumber: Number(searchTerm) }]
                        : [];
                }

                return [{ [column]: { $regex: searchTerm, $options: 'i' } }];
            });

            if (searchConditions.length > 0) {
                searchQuery = {
                    ...cleanFilters,
                    $or: searchConditions
                };
            }
        }

        const validFields = Object.keys(inquiryModel.schema.paths);
        const finalQuery = {};

        Object.entries(searchQuery).forEach(([key, value]) => {
            if (key === '$or') {
                finalQuery.$or = value.filter(condition => {
                    const fieldName = Object.keys(condition)[0];
                    return validFields.includes(fieldName) || fieldName === 'firstName' || fieldName === 'lastName';
                });
            } else if (validFields.includes(key)) {
                finalQuery[key] = value;
            }
        });
        let records = await inquiryModel.find(finalQuery, {
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

        records = records.map((record, index) => ({
            sno: index + 1,
            name: `${record.firstName} ${record.lastName}`,
            contactNumber: record.contactNumber,
            inquiryFor: record.inquiryFor,
            followUpDate: formatTimestamp(record.followUpDate),
            attendedBy: record.attendedBy,
            status: record.status,
            convertibility: record.convertibility,
            _id: record._id
        }));

        const total = await inquiryModel.countDocuments(finalQuery);

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