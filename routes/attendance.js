const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientAttendanceModel, employeeAttendanceModel } = require('../models/attendance.model');
const { formatTime } = require('../helper/steroids');
const { clientMembershipModel } = require('../models/membership.model');
const { clientModel } = require('../models/others.model');

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
            date: attendance.date || null,
            inTime: attendance.inTime || null,
            outTime: attendance.outTime || null
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
        const { biometricId, name, memberId, contactNumber } = req.body.myData;
        const todayDate = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
        const currentTime = Math.floor(new Date().getTime() / 1000);

        // Get attendance records for today, sorted by creation time (most recent first)
        const todayAttendance = await clientAttendanceModel
            .find({
                biometricId,
                date: todayDate,
                category: "clients"
            })
            .sort({ createdAt: -1 })
            .limit(1);

        let attendanceRecord;
        let message;

        if (todayAttendance.length === 0) {
            // No attendance record for today - create new "in" record
            attendanceRecord = await clientAttendanceModel.create({
                biometricId,
                name,
                memberId,
                contactNumber,
                inTime: currentTime,
                date: todayDate,
                category: "clients"
            });
            message = 'Attendance In Marked Successfully';
        } else {
            const latestRecord = todayAttendance[0];

            if (!latestRecord.outTime) {
                // Latest record has no outTime - mark as "out"
                attendanceRecord = await clientAttendanceModel.findByIdAndUpdate(
                    latestRecord._id,
                    { outTime: currentTime },
                    { new: true }
                );
                message = 'Attendance Out Marked Successfully';
            } else {
                // Both in and out exist in latest record - create new "in" record
                attendanceRecord = await clientAttendanceModel.create({
                    biometricId,
                    name,
                    memberId,
                    contactNumber,
                    inTime: currentTime,
                    date: todayDate,
                    category: "clients"
                });
                message = 'New Attendance In Marked Successfully';
            }
        }

        return res.send({
            status: 'success',
            message,
            data: attendanceRecord
        });

    } catch (error) {
        console.log("Error in attendance route::POST::/attendance/client/create", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
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
            date: attendance.date,
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
        const { employeeId, employeeName, employeeNumber, employeeEmail, employeeDesignation, employeeSalary, category } = req.body.myData;
        const todayDate = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
        const currentTime = Math.floor(new Date().getTime() / 1000);

        // Get attendance records for today, sorted by creation time (most recent first)
        const todayAttendance = await employeeAttendanceModel
            .find({
                employeeId,
                date: todayDate,
                category
            })
            .sort({ createdAt: -1 })
            .limit(1);

        let attendanceRecord;
        let message;

        if (todayAttendance.length === 0) {
            // No attendance record for today - create new "in" record
            attendanceRecord = await employeeAttendanceModel.create({
                employeeId,
                employeeName,
                employeeNumber,
                employeeEmail,
                employeeDesignation,
                employeeSalary,
                category,
                inTime: currentTime,
                date: todayDate
            });
            message = 'Employee Attendance In Marked Successfully';
        } else {
            const latestRecord = todayAttendance[0];

            if (!latestRecord.outTime) {
                // Latest record has no outTime - mark as "out"
                attendanceRecord = await employeeAttendanceModel.findByIdAndUpdate(
                    latestRecord._id,
                    { outTime: currentTime },
                    { new: true }
                );
                message = 'Employee Attendance Out Marked Successfully';
            } else {
                // Both in and out exist in latest record - create new "in" record
                attendanceRecord = await employeeAttendanceModel.create({
                    employeeId,
                    employeeName,
                    employeeNumber,
                    employeeEmail,
                    employeeDesignation,
                    employeeSalary,
                    category,
                    inTime: currentTime,
                    date: todayDate
                });
                message = 'New Employee Attendance In Marked Successfully';
            }
        }

        return res.send({
            status: 'success',
            message,
            data: attendanceRecord
        });

    } catch (error) {
        console.log("Error in attendance route::POST::/attendance/employee/create", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

router.post('/inconsistent-clients', authenticate, async (req, res) => {
    try {
        const { filters, dateRange, absentThreshold = 4 } = req.body.myData || {};

        // Parse date range
        const fromDate = dateRange?.from ? Math.floor(new Date(dateRange.from).setHours(0, 0, 0, 0) / 1000) : Math.floor(new Date().setDate(new Date().getDate() - 30) / 1000);
        const toDate = dateRange?.to ? Math.floor(new Date(dateRange.to).setHours(23, 59, 59, 999) / 1000) : Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);

        // Get all active memberships within the date range
        const activeMemberships = await clientMembershipModel.find({
            status: 'active',
            joiningDate: { $lte: toDate },
            endDate: { $gte: fromDate },
            ...filters
        });

        // Get unique client codes and member IDs
        const clientCodes = [...new Set(activeMemberships.map(m => m.clientCode).filter(code => code))];
        const memberIds = [...new Set(activeMemberships.map(m => m.memberId).filter(id => id))];

        // Fetch client details
        const clients = await clientModel.find(
            { clientCode: { $in: clientCodes } },
            { clientName: 1, contactNumber: 1, picture: 1, clientCode: 1, gender: 1 }
        );

        // Create client lookup map
        const clientMap = {};
        clients.forEach(client => {
            clientMap[client.clientCode] = client;
        });

        // Get attendance records for all members in the date range
        const attendanceRecords = await clientAttendanceModel.find({
            memberId: { $in: memberIds },
            date: { $gte: fromDate, $lte: toDate }
        }, { memberId: 1, date: 1, inTime: 1, outTime: 1 });

        // Group attendance by memberId
        const attendanceByMember = {};
        attendanceRecords.forEach(record => {
            if (!attendanceByMember[record.memberId]) {
                attendanceByMember[record.memberId] = [];
            }
            attendanceByMember[record.memberId].push(record);
        });

        // Calculate total days in date range
        const totalDays = Math.ceil((toDate - fromDate) / (24 * 60 * 60));

        // Analyze each membership for inconsistency
        const inconsistentClients = [];

        activeMemberships.forEach(membership => {
            const clientDetails = clientMap[membership.clientCode] || {};
            const memberAttendance = attendanceByMember[membership.memberId] || [];

            // Calculate membership active days within date range
            const membershipStart = Math.max(membership.joiningDate, fromDate);
            const membershipEnd = Math.min(membership.endDate, toDate);
            const activeDays = Math.ceil((membershipEnd - membershipStart) / (24 * 60 * 60)) + 1;

            // Count actual attendance days
            const attendanceDays = memberAttendance.length;
            const absentDays = Math.max(0, activeDays - attendanceDays);

            // Check if client is inconsistent based on threshold
            if (absentDays >= absentThreshold && activeDays > 0) {
                inconsistentClients.push({
                    memberId: membership.memberId,
                    clientName: clientDetails.clientName || '',
                    contactNumber: clientDetails.contactNumber || '',
                    packageName: membership.packageName,
                    billType: membership.billType,
                    joiningDate: membership.joiningDate,
                    endDate: membership.endDate,
                    activeDays,
                    attendanceDays,
                    absentDays,
                    attendancePercentage: Math.round((attendanceDays / activeDays) * 100),
                    lastAttendance: memberAttendance.length > 0
                        ? Math.max(...memberAttendance.map(a => a.date))
                        : null
                });
            }
        });

        // Sort by absent days (highest first)
        inconsistentClients.sort((a, b) => b.absentDays - a.absentDays);

        return res.send({
            status: 'success',
            data: {
                records: inconsistentClients.map((client, index) => ({
                    sno: index + 1,
                    ...client
                })),
                totalData: inconsistentClients.length,
                summary: {
                    totalAnalyzed: activeMemberships.length,
                    inconsistentCount: inconsistentClients.length,
                    dateRange: { from: fromDate, to: toDate },
                    absentThreshold
                }
            },
            message: 'Inconsistent Clients Fetched Successfully'
        });

    } catch (error) {
        console.log("Error in attendance route::POST::/attendance/inconsistent-clients", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

module.exports = router;