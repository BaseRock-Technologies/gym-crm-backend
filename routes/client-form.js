const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientFormModel } = require('../models/client-form.model');
const { formatTimestamp } = require('../helper/steroids');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        await clientFormModel.create(data);
        return res.send({ status: 'success', message: 'Form Created Successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/client-form/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { category, filters, searchConfig } = req.body.myData;
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
        console.log(category)
        const validFields = Object.keys(clientFormModel.schema.paths);
        const finalQuery = { category };

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

        const clientForms = await clientFormModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedForms = clientForms.map(clientForm => ({
            ...clientForm.toObject(),
            date: formatTimestamp(clientForm.date)
        }));

        const total = await clientFormModel.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedForms,
                totalData: total,
            },
            message: 'Forms Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in auth route::POST::/clilent-form/records", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;