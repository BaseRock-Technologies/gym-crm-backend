const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { clientSourceModel, taxCategoryModel, paymentMethodModel, trainersModel, clientModel } = require("../models/others.model");
const { groupTheArrayOn } = require('../helper/steroids');
const { packageModel } = require('../models/package.model');
const { clientMembershipModel, clientMembershipHistoryModel } = require('../models/membership.model');
const clientModelSchema = require('../models/others.model').clientModel.schema; // Adjust the path as necessary

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

        const { clientName, contactNumber } = data;

        const updateFields = {};
        const clientFields = Object.keys(clientModelSchema.paths).filter(field => field !== '__v' && field !== '_id');
        clientFields.forEach(field => {
            if (data[field] !== undefined) {
                updateFields[field] = data[field];
            }
        });

        await clientModel.findOneAndUpdate({ contactNumber, clientName }, { $set: updateFields });

        await clientMembershipModel.create(data);

        const historyData = {
            memberId: data.memberId,
            billId: data.billId,
            billType: data.billType,
            freezeHistory: []
        };
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
            .findOne({ memberId: billId, billType }, { createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, _id: 0, billType: 0 })
            .sort({ createdAt: -1 })
            .lean();

        if (!existingBill) {
            return res.send({ status: 'error', message: 'Data not found' });
        }

        const clientDetails = await clientModel.findOne({ clientCode: existingBill.clientCode }, { createdAt: 0, createdBy: 0, __v: 0, _id: 0 }).lean();
        const data = {
            ...existingBill,
            ...clientDetails
        }
        return res.send({ status: 'success', data, message: 'Bill fetched successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/bills/gym-bill/:id", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.patch('/update', authenticate, async (req, res) => {
    try {
        const { billId, billType } = req.body.myData;
        const data = req.body.myData;

        const existingBill = await clientMembershipModel.findOne({ memberId: billId, billType }).lean();
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

        const isBillAvailable = await clientMembershipModel.findOne({ billId, billType }).lean();
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

router.post('/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters, searchConfig, type } = req.body.myData || {};
        const cleanFilters = { ...filters };

        // Skip filters with "all" value
        Object.keys(cleanFilters).forEach(key => {
            if (cleanFilters[key] === 'all') {
                delete cleanFilters[key];
            }
        });

        // Handle pending payments type
        if (type === 'pending-payments') {
            cleanFilters.balanceAmount = { $gt: 0 };
        }

        // Handle upcoming renewals type
        if (type === 'upcoming-renewals') {
            // If date range is provided, filter by endDate within the range
            if (cleanFilters['date-range'] && cleanFilters['date-range'].from && cleanFilters['date-range'].to) {
                const fromDate = Math.floor(new Date(cleanFilters['date-range'].from).getTime() / 1000);
                const toDate = Math.floor(new Date(cleanFilters['date-range'].to).getTime() / 1000);

                cleanFilters.endDate = {
                    $gte: fromDate,
                    $lte: toDate
                };
                delete cleanFilters['date-range'];
            }
        }

        let searchQuery = cleanFilters;

        if (searchConfig && searchConfig.searchTerm && searchConfig.searchableColumns?.length) {
            const searchTerm = searchConfig.searchTerm.trim();
            const searchConditions = searchConfig.searchableColumns.map(column => ({
                [column]: { $regex: searchTerm, $options: 'i' }
            }));

            if (searchConditions.length > 0) {
                searchQuery = {
                    ...cleanFilters,
                    $or: searchConditions
                };
            }
        }

        const validFields = Object.keys(clientMembershipModel.schema.paths);
        const finalQuery = {};

        Object.entries(searchQuery).forEach(([key, value]) => {
            if (key === '$or') {
                finalQuery.$or = value.filter(condition => {
                    const fieldName = Object.keys(condition)[0];
                    return validFields.includes(fieldName);
                });
            } else if (validFields.includes(key)) {
                finalQuery[key] = value;
            }
        });

        const bills = await clientMembershipModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Get unique client codes from bills
        const clientCodes = [...new Set(bills.map(bill => bill.clientCode).filter(code => code))];

        // Fetch client details
        const clients = await clientModel.find(
            { clientCode: { $in: clientCodes } },
            { clientName: 1, contactNumber: 1, picture: 1, clientCode: 1 }
        );

        // Create a map for quick client lookup
        const clientMap = {};
        clients.forEach(client => {
            clientMap[client.clientCode] = client;
        });

        // Format bills with client details and only required fields
        const formattedBills = bills.map((bill, index) => {
            const clientDetails = clientMap[bill.clientCode] || {};

            return {
                sno: index + 1,
                createdAt: bill.createdAt,
                clientName: clientDetails.clientName || '',
                contactNumber: clientDetails.contactNumber || '',
                clientPicture: clientDetails.picture || '',
                billType: bill.billType,
                packageName: bill.packageName,
                balanceAmount: bill.balanceAmount,
                clientRepresentative: bill.clientRepresentative || '',
                endDate: bill.endDate,
                // Keep these for actions
                billId: bill.billId,
                memberId: bill.memberId
            };
        });

        const total = await clientMembershipModel.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedBills,
                totalData: total,
            },
            message: 'Bills Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in bills route::POST::/bills/records", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

module.exports = router;