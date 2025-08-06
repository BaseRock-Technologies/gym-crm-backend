const express = require('express');
const { authenticate } = require('../helper/auth');
const { followupsModel } = require('../models/followups.model');
const { clientModel } = require('../models/others.model');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;

        // Validate required fields
        if (!data.followupDate) {
            return res.status(400).send({
                status: 'error',
                message: 'Missing required field(s)'
            });
        }

        let client;
        if (data.clientCode) {
            // Get client information
            client = await clientModel.findOne({ clientCode: data.clientCode });
            if (!client) {
                return res.status(404).send({
                    status: 'error',
                    message: 'Client not found'
                });
            }
        }

        // Prepare followup data
        const followupData = {
            contactNumber: client?.contactNumber || data.contactNumber,
            clientName: client?.clientName || data.clientName,
            followupType: data.followupType,
            followupDate: data.followupDate,
            followupTime: data.followupTime,
            feedback: data.feedback || '',
            status: 'pending',
            createdBy: req.headers.userName || '',
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000)
        };

        await followupsModel.create(followupData);
        return res.send({
            status: 'success',
            message: 'Followup Created Successfully'
        });
    } catch (error) {
        console.log("Error in followup route::POST::/followup/create", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

router.post('/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters, searchConfig } = req.body.myData || {};
        const cleanFilters = { ...filters };

        // Skip filters with "all" value
        Object.keys(cleanFilters).forEach(key => {
            if (cleanFilters[key] === 'all') {
                delete cleanFilters[key];
            }
        });

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

        const validFields = Object.keys(followupsModel.schema.paths);
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

        const followups = await followupsModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedFollowups = followups.map((followup, index) => ({
            sno: index + 1,
            ...followup.toObject(),
        }));

        const total = await followupsModel.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedFollowups,
                totalData: total,
            },
            message: 'Followups Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in followup route::POST::/followup/records", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

router.post('/update-status/:id', authenticate, async (req, res) => {
    try {
        const { status } = req.body.myData;
        const followupId = req.params.id;

        await followupsModel.findByIdAndUpdate(followupId, { status });

        return res.send({
            status: 'success',
            message: 'Followup Status Updated Successfully'
        });
    } catch (error) {
        console.log("Error in followup route::POST::/followup/update-status", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

router.post('/delete/:id', authenticate, async (req, res) => {
    try {
        const followupId = req.params.id;
        await followupsModel.findByIdAndDelete(followupId);

        return res.send({
            status: 'success',
            message: 'Followup Deleted Successfully'
        });
    } catch (error) {
        console.log("Error in followup route::POST::/followup/delete", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

module.exports = router;