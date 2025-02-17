const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientModel } = require('../models/others.model');
const { clientMembershipModel, clientMembershipHistoryModel } = require('../models/membsrship.model');
const { formatTimestamp } = require('../helper/steroids');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const { clientName, contactNumber, email, clientCode } = req.body.myData;

        const existingClient = await clientModel.findOne({ clientName, contactNumber });
        if (existingClient) {
            return res.send({ status: 'success', exists: true, message: "Client Already Exists" });
        }
        const totalClientAvailable = await clientModel.countDocuments();
        const data = {
            clientName,
            contactNumber,
            email,
            clientCode,
            clientId: totalClientAvailable + 1,
            createdBy: req.headers.userName,
        };
        await clientModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Client Created Successfully' });
    } catch (error) {
        console.log("Error in auth route::/clients/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters, searchConfig } = req.body.myData;
        const cleanFilters = { ...filters };

        if (cleanFilters.clientStatus) {
            const oneMonthAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
            if (cleanFilters.clientStatus === 'new-client') {
                cleanFilters.createdAt = { $gte: oneMonthAgo };
                delete cleanFilters.clientStatus;
            } else {
                cleanFilters.status = cleanFilters.clientStatus;
                delete cleanFilters.clientStatus;
            }
        }

        let searchQuery = cleanFilters;

        if (searchConfig && searchConfig.searchTerm && searchConfig.searchableColumns?.length) {
            const searchTerm = searchConfig.searchTerm.trim();
            const searchConditions = searchConfig.searchableColumns.flatMap(column => {
                if (column === 'clientName') {
                    return [
                        { clientName: { $regex: searchTerm, $options: 'i' } },
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

        const validFields = Object.keys(clientMembershipModel.schema.paths);
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

        let records = await clientMembershipModel.aggregate([
            { $match: finalQuery },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: { memberId: "$memberId", billType: "$billType" },
                    recentRecord: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$recentRecord" } },
            {
                $project: {
                    billId: 1,
                    gender: 1,
                    clientName: 1,
                    contactNumber: 1,
                    clientCode: 1,
                    packageName: 1,
                    joiningDate: 1,
                    endDate: 1,
                    billType: 1,
                }
            },
            { $skip: offset * limit },
            { $limit: limit }
        ]);
        const clientCodes = records.map(record => record.clientCode);
        const billIdAndType = records.map(record => ({ billId: record.billId, billType: record.billType }));
        const clients = await clientModel.find({ clientCode: { $in: clientCodes } }, { clientCode: 1, picture: 1, clientId: 1, });

        const clientPictures = {};
        const clientIds = {};
        clients.forEach(client => {
            clientPictures[client.clientCode] = client.picture;
            clientIds[client.clientCode] = client.clientId;
        });

        records = records.map(record => ({
            ...record,
            joiningDate: formatTimestamp(record.joiningDate),
            endDate: formatTimestamp(record.endDate),
            clientPicture: clientPictures[record.clientCode] || null,
            clientId: clientIds[record.clientCode] || null,
        }));

        delete records[clientCodes];

        const total = await clientMembershipModel.countDocuments(finalQuery);

        const historyRecords = await Promise.all(billIdAndType.map(async ({ billId, billType }) => {
            return await clientMembershipHistoryModel.find({ billId, billType }, { freezeHistory: 1, _id: 0 });
        }));

        const historyMap = {};
        historyRecords.forEach((historyArray, index) => {
            const { billId, billType } = billIdAndType[index];
            historyMap[`${billId}-${billType}`] = historyArray.sort((a, b) => b.createdAt - a.createdAt);
        });
        records = records.map(record => {
            const key = `${record.billId}-${record.billType}`;
            return {
                ...record,
                history: historyMap[key][0] || []
            };
        });

        return res.send({
            status: 'success',
            data: {
                records,
                totalData: total,
            },
            message: 'Records fetched successfully'
        });
    } catch (error) {
        console.log("Error in auth route POST::/client/records", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/profile', authenticate, async (req, res) => {
    try {
        const { clientId } = req.body.myData;

        const clientDetails = await clientModel.findOne({ clientId });

        if (!clientDetails) {
            return res.send({ status: 'error', message: 'No data found' });
        }

        return res.send({ status: 'success', data: clientDetails, message: 'Client Details fetched Successfully' });
    } catch (error) {
        console.log("Error in auth route::/client/profile", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/update', authenticate, async (req, res) => {
    try {
        const { clientId, updateData } = req.body.myData;

        const clientDetails = await clientModel.findOne({ clientId });

        if (!clientDetails) {
            return res.send({ status: 'error', message: 'No data found' });
        }

        await clientModel.updateOne({ clientId }, { $set: updateData });

        return res.send({ status: 'success', message: 'Client Details updated Successfully' });
    } catch (error) {
        console.log("Error in auth route::/client/update", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});


module.exports = router;