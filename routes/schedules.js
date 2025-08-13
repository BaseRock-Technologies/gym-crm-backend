const express = require('express');
const { authenticate } = require('../helper/auth');
const { scheduleModel } = require('../models/others.model');
const { clientModel } = require('../models/others.model');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        data.createdBy = req.headers.userName;

        await scheduleModel.create(data);
        return res.send({
            status: 'success',
            message: 'Schedule Created Successfully'
        });
    } catch (error) {
        console.log("Error in schedules route::POST::/schedules/create", error);
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

        // Handle date range filter mapping to scheduleDate unix seconds
        if (cleanFilters && cleanFilters['date-range']) {
            try {
                const { from, to } = cleanFilters['date-range'] || {};
                if (from || to) {
                    const fromUnix = from ? Math.floor(new Date(from).getTime() / 1000) : undefined;
                    const toUnix = to ? Math.floor(new Date(to).getTime() / 1000) : undefined;
                    cleanFilters.scheduleDate = {};
                    if (fromUnix !== undefined) cleanFilters.scheduleDate.$gte = fromUnix;
                    if (toUnix !== undefined) cleanFilters.scheduleDate.$lte = toUnix;
                }
            } catch (_) { }
            delete cleanFilters['date-range'];
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

        const validFields = Object.keys(scheduleModel.schema.paths);
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

        const schedules = await scheduleModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedSchedules = schedules.map((schedule, index) => ({
            sno: index + 1,
            id: schedule._id,
            clientName: schedule.clientName,
            trainerName: schedule.trainerName,
            timeFrom: schedule.timeFrom,
            timeTo: schedule.timeTo,
            scheduleDate: schedule.scheduleDate,
        }));

        const total = await scheduleModel.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedSchedules,
                totalData: total,
            },
            message: 'Schedules Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in schedules route::POST::/schedules/records", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

router.patch('/update/:id', authenticate, async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const updateData = { ...(req.body.myData || {}), updatedAt: Math.floor(Date.now() / 1000) };
        await scheduleModel.findByIdAndUpdate(scheduleId, updateData);

        return res.send({
            status: 'success',
            message: 'Schedule Updated Successfully'
        });
    } catch (error) {
        console.log("Error in schedules route::PATCH::/schedules/update/:id", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

router.post('/delete/:id', authenticate, async (req, res) => {
    try {
        const scheduleId = req.params.id;
        if (!scheduleId) {
            return res.status(400).send({
                status: 'error',
                message: 'Schedule ID is required'
            });
        }
        await scheduleModel.findByIdAndDelete(scheduleId);

        return res.send({
            status: 'success',
            message: 'Schedule Deleted Successfully'
        });
    } catch (error) {
        console.log("Error in schedules route::POST::/schedules/delete", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

module.exports = router;