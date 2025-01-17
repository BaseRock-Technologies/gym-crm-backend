const express = require('express');
const { authenticate } = require('../helper/auth');
const { feedbackModel } = require('../models/feedback.model');
const { formatTimestamp } = require('../helper/steroids');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        await feedbackModel.create(data);
        return res.send({ status: 'success', message: 'Feedback Created Successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/feedback/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters, searchConfig } = req.body.myData;
        const cleanFilters = { ...filters };

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

        const validFields = Object.keys(feedbackModel.schema.paths);
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

        const feedbacks = await feedbackModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedFeedbacks = feedbacks.map(feedback => ({
            ...feedback.toObject(),
            date: formatTimestamp(feedback.date)
        }));

        const total = await feedbackModel.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedFeedbacks,
                totalData: total,
            },
            message: 'Feedbacks Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in auth route::POST::/feedbacks/list", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;