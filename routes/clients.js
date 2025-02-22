const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientModel } = require('../models/others.model');
const { clientMembershipModel, clientMembershipHistoryModel } = require('../models/membsrship.model');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const { clientName, contactNumber, email, clientCode } = req.body.myData;

        const existingClient = await clientModel.findOne({ clientName, contactNumber }).lean();
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
                    memberId: 1,
                    billId: 1,
                    clientCode: 1,
                    packageName: 1,
                    joiningDate: 1,
                    endDate: 1,
                    billType: 1,
                    status: 1,
                }
            },
            { $skip: offset * limit },
            { $limit: limit }
        ]);
        const clientCodes = records.map(record => record.clientCode);
        const billIdAndType = records.map(record => ({ billId: record.billId, billType: record.billType }));
        const clients = await clientModel.find({ clientCode: { $in: clientCodes } }, { clientName: 1, contactNumber: 1, gender: 1, clientCode: 1, picture: 1, clientId: 1 });

        // Create a map for quick lookup of client details
        const clientMap = {};
        clients.forEach(client => {
            clientMap[client.clientCode] = client; // Store the entire client object
        });

        records = records.map(record => {
            const clientDetails = clientMap[record.clientCode] || {};
            return {
                ...record,
                joiningDate: record.joiningDate,
                endDate: record.endDate,
                clientPicture: clientDetails.picture || null,
                clientId: clientDetails.clientId || null,
                clientName: clientDetails.clientName || null, // Add any other client details you need
                contactNumber: clientDetails.contactNumber || null,
                gender: clientDetails.gender || null,
            };
        });

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
        const { memberId } = req.body.myData;

        const membershipDetails = await clientMembershipModel.findOne({ memberId }).lean();
        if (!membershipDetails) {
            return res.send({ status: 'error', message: 'Membership details not found' });
        }

        const clientDetails = await clientModel.findOne({ clientCode: membershipDetails.clientCode }, { _id: 0, __v: 0, email: 0, createdBy: 0, createdAt: 0, clientCode: 0, clientId: 0, }).lean();
        if (!clientDetails) {
            return res.send({ status: 'error', message: 'No data found for the client' });
        }

        const data = {
            ...clientDetails,
            joiningDate: membershipDetails.joiningDate,
            memberId: membershipDetails.memberId,
        }

        return res.send({ status: 'success', data, message: 'Client Details fetched Successfully' });
    } catch (error) {
        console.log("Error in auth route::/client/profile", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

// router.post('/update', authenticate, async (req, res) => {
//     try {
//         const { memberId, joiningDate = null, ...updateData } = req.body.myData;

//         const membershipDetails = await clientMembershipModel.findOne({ memberId }).lean();
//         if (!membershipDetails) {
//             return res.send({ status: 'error', message: 'No details not found' });
//         }

//         const clientDetails = await clientModel.findOne({ clientCode: membershipDetails.clientCode }).lean();

//         if (!clientDetails) {
//             return res.send({ status: 'error', message: 'No data found' });
//         }

//         await clientModel.updateOne({ clientCode: clientDetails.clientCode }, { $set: updateData });

//         return res.send({ status: 'success', message: 'Client Details updated Successfully' });
//     } catch (error) {
//         console.log("Error in auth route::/client/update", error);
//         return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
//     }
// });


module.exports = router;