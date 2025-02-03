const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientModel } = require('../models/others.model');
const { clientMembershipModel } = require('../models/membsrship.model');
const { formatTimestamp } = require('../helper/steroids');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const { clientName, contactNumber, email, clientId } = req.body.myData;

        const existingClient = await clientModel.findOne({ clientName, contactNumber });
        if (existingClient) {
            return res.send({ status: 'success', exists: true, message: "Client Already Exists" });
        }
        const totalClientAvailable = await clientModel.countDocuments();
        const data = {
            clientName,
            contactNumber,
            email,
            clientId,
            memberId: totalClientAvailable + 1,
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
                    memberId: 1,
                    gender: 1,
                    clientName: 1,
                    contactNumber: 1,
                    clientId: 1,
                    packageName: 1,
                    joiningDate: 1,
                    endDate: 1,
                    billType: 1,

                }
            },
            { $skip: offset * limit },
            { $limit: limit }
        ]);
        const clientIds = records.map(record => record.clientId);
        const clients = await clientModel.find({ clientId: { $in: clientIds } }, { clientId: 1, picture: 1 });
        const clientPictures = {};
        clients.forEach(client => {
            clientPictures[client.clientId] = client.picture;
        });

        records = records.map(record => ({
            ...record,
            joiningDate: formatTimestamp(record.joiningDate),
            endDate: formatTimestamp(record.endDate),
            clientPicture: clientPictures[record.clientId] || null
        }));

        const total = await clientMembershipModel.countDocuments(finalQuery);

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
module.exports = router;