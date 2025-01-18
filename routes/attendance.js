const express = require('express');
const { authenticate } = require('../helper/auth');
const { attendanceModel } = require('../models/attendance.model');
const { formatTimestamp, formatTime } = require('../helper/steroids');

const router = express.Router();

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

        const validFields = Object.keys(attendanceModel.schema.paths);
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

        const attendanceRecords = await attendanceModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedAttendance = attendanceRecords.map(attendance => ({
            ...attendance.toObject(),
            date: formatTimestamp(attendance.date),
            inTime: formatTime(attendance.inTime),
            outTime: formatTime(attendance.outTime)
        }));

        const total = await attendanceModel.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedAttendance,
                totalData: total,
            },
            message: 'Attendance Records Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in attendance route::POST::/attendance/records", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/create', authenticate, async (req, res) => {
    try {
        const { biometricId, name, memberId, contactNumber, type } = req.body.myData;
        if (!type) {
            return res.status(400).send({ status: 'error', message: 'Missing Type Field' });
        }
        const todayDate = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

        if (type === 'in') {
            const attendanceRecord = await attendanceModel.create({
                biometricId,
                name,
                memberId,
                contactNumber,
                inTime: Math.floor(new Date().getTime() / 1000),
                date: todayDate,
            });
            return res.send({ status: 'success', message: 'Attendance Created Successfully', data: attendanceRecord });
        } else if (type === 'out') {
            const updatedRecord = await attendanceModel.findOneAndUpdate(
                { biometricId, date: todayDate },
                { outTime: Math.floor(new Date().getTime() / 1000) },
                { new: true }
            );
            if (!updatedRecord) {
                return res.status(404).send({ status: 'error', message: 'No active attendance record found for today' });
            }
            return res.send({ status: 'success', message: 'Attendance Updated Successfully', data: updatedRecord });
        } else {
            return res.status(400).send({ status: 'error', message: 'Invalid type parameter' });
        }
    } catch (error) {
        console.log("Error in attendance route::POST::/attendance/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

module.exports = router;