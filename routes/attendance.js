const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientAttendanceModel, employeeAttendanceModel } = require('../models/attendance.model');
const { formatTimestamp, formatTime } = require('../helper/steroids');

const router = express.Router();

router.post('/client/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters, searchConfig, category } = req.body.myData;
        const cleanFilters = { ...filters };

        // Handle date range
        if (filters && filters['date-range']) {
            const { from, to } = filters['date-range'];
            cleanFilters.date = {
                $gte: new Date(from).getTime() / 1000,
                $lte: new Date(to).getTime() / 1000
            };
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

        const validFields = Object.keys(clientAttendanceModel.schema.paths);
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

        const attendanceRecords = await clientAttendanceModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });


        const formattedAttendance = attendanceRecords.map((attendance, index) => ({
            sno: index + 1,
            ...attendance.toObject(),
            date: formatTimestamp(attendance.date) || null,
            inTime: formatTime(attendance.inTime) || null,
            outTime: formatTime(attendance.outTime) || null
        }));

        const total = await clientAttendanceModel.countDocuments(finalQuery);

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

router.post('/client/create', authenticate, async (req, res) => {
    try {
        const { biometricId, name, memberId, contactNumber, type } = req.body.myData;
        if (!type) {
            return res.status(400).send({ status: 'error', message: 'Missing Type Field' });
        }
        const todayDate = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

        if (type === 'in') {
            const attendanceRecord = await clientAttendanceModel.create({
                biometricId,
                name,
                memberId,
                contactNumber,
                inTime: Math.floor(new Date().getTime() / 1000),
                date: todayDate,
            });
            return res.send({ status: 'success', message: 'Attendance Created Successfully', data: attendanceRecord });
        } else if (type === 'out') {
            const updatedRecord = await clientAttendanceModel.findOneAndUpdate(
                { biometricId, date: todayDate, category: "clients" },
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

router.post('/employee/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters, searchConfig, category } = req.body.myData;
        const cleanFilters = { ...filters };

        // Handle date range
        if (filters && filters['date-range']) {
            const { from, to } = filters['date-range'];
            cleanFilters.date = {
                $gte: new Date(from).getTime() / 1000,
                $lte: new Date(to).getTime() / 1000
            };
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

        const validFields = Object.keys(employeeAttendanceModel.schema.paths);
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

        const attendanceRecords = await employeeAttendanceModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedAttendance = attendanceRecords.map((attendance, index) => ({
            sno: index + 1,
            ...attendance.toObject(),
            date: formatTimestamp(attendance.date),
            inTime: formatTime(attendance.inTime),
            outTime: formatTime(attendance.outTime)
        }));

        const total = await employeeAttendanceModel.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedAttendance,
                totalData: total,
            },
            message: 'Employee Attendance Records Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in attendance route::POST::/employee/records", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/employee/create', authenticate, async (req, res) => {
    try {
        const { employeeId, employeeName, employeeNumber, employeeEmail, employeeDesignation, employeeSalary, category, type, } = req.body.myData;
        if (!type) {
            return res.status(400).send({ status: 'error', message: 'Missing Type Field' });
        }
        const todayDate = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

        if (type === 'in') {
            const attendanceRecord = await employeeAttendanceModel.create({
                employeeId,
                employeeName,
                employeeNumber,
                employeeEmail,
                employeeDesignation,
                employeeSalary,
                category,
                inTime: Math.floor(new Date().getTime() / 1000),
                date: todayDate,
            });
            return res.send({ status: 'success', message: 'Employee Attendance Created Successfully', data: attendanceRecord });
        } else if (type === 'out') {
            const updatedRecord = await employeeAttendanceModel.findOneAndUpdate(
                { employeeId, date: todayDate, category },
                { outTime: Math.floor(new Date().getTime() / 1000) },
                { new: true }
            );
            if (!updatedRecord) {
                return res.status(404).send({ status: 'error', message: 'No active attendance record found for today' });
            }
            return res.send({ status: 'success', message: 'Employee Attendance Updated Successfully', data: updatedRecord });
        } else {
            return res.status(400).send({ status: 'error', message: 'Invalid type parameter' });
        }
    } catch (error) {
        console.log("Error in attendance route::POST::/employee/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

module.exports = router;