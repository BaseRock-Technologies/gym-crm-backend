const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientSourceModel, paymentMethodModel, taxCategoryModel, trainersModel, employeeModel, clientModel } = require('../models/others.model');
const { clientMembershipModel } = require('../models/membership.model');
const router = express.Router();


router.post('/client-source/create', authenticate, async (req, res) => {
    try {
        const { clientSource } = req.body.myData;

        const existingSource = await clientSourceModel.findOne({ clientSource }).lean();
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Client Source Already Exists" });
        }

        const data = {
            clientSource,
            createdBy: req.headers.userName,
        };
        await clientSourceModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Client Source Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/client-source/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/trainer/create', authenticate, async (req, res) => {
    try {
        const { trainer } = req.body.myData;

        const existingSource = await trainersModel.findOne({ trainer }).lean();
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Trainer Already Exists" });
        }

        const data = {
            trainer,
            createdBy: req.headers.userName,
        };
        await trainersModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Trainer Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/trainer/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/payment-method/create', authenticate, async (req, res) => {
    try {
        const { paymentMode } = req.body.myData;

        const existingSource = await paymentMethodModel.findOne({ paymentMode }).lean();
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Payment Method Already Exists" });
        }

        const data = {
            paymentMode,
            createdBy: req.headers.userName,
        };
        await paymentMethodModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Payment Method Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/payment-method/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/tax/create', authenticate, async (req, res) => {
    try {
        const { taxName, chargesPercentage, category } = req.body.myData;

        const existingSource = await taxCategoryModel.findOne({ taxName, category }).lean();
        if (existingSource) {
            return res.send({ status: 'success', exists: true, message: "Tax Already Exists" });
        }

        const data = {
            taxName,
            chargesPercentage,
            category,
            createdBy: req.headers.userName,
        };
        await taxCategoryModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Tax Added successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/tax/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/employee/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;

        const existingEmployee = await employeeModel.findOne({ fullName: data.fullName, contact: data.contact, gender: data.gender }).lean();
        if (existingEmployee) {
            return res.send({ status: 'info', exists: true, message: "Employee Already Exists" });
        }
        data.createdBy = req.headers.userName;
        await employeeModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Employee Created successfully' });
    } catch (error) {
        console.log("Error in auth route::/others/employee/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

//list the employees
router.post('/employee/list', authenticate, async (req, res) => {
    try {
        let employees = await employeeModel.find({ status: "active" }, { __v: 0 }).lean();
        employees = employees.reduce((acc, employee) => {
            acc.default.push({
                employeeName: employee.fullName,
                contactNumber: employee.contact,
                _id: employee._id
            }); return acc;
        }, { default: [] })
        return res.send({
            status: 'success',
            data: employees,
            message: 'Employees fetched successfully'
        });
    } catch (error) {
        console.log("Error in auth route::/others/employee/list", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
// Get client by ID
router.get('/client/:clientId', authenticate, async (req, res) => {
    try {
        const { clientId } = req.params;

        const client = await clientModel.findById(clientId, {
            clientName: 1,
            contactNumber: 1,
            clientCode: 1,
            email: 1,
            gender: 1,
            address: 1
        }).lean();

        if (!client) {
            return res.status(404).send({
                status: 'error',
                message: 'Client not found'
            });
        }

        return res.send({
            status: 'success',
            data: client,
            message: 'Client fetched successfully'
        });
    } catch (error) {
        console.log("Error in auth route::/others/client/:clientId", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

// Get all clients for dropdown
router.post('/clients/list', authenticate, async (req, res) => {
    try {
        let clients = await clientModel.find({}, {
            _id: 1,
            clientName: 1,
            contactNumber: 1,
            clientCode: 1,
        }).lean();
        clients = clients.reduce((acc, val) => { acc.default.push(val); return acc; }, { default: [] })
        return res.send({
            status: 'success',
            data: clients,
            message: 'Clients fetched successfully'
        });
    } catch (error) {
        console.log("Error in auth route::/others/clients", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

// Get clients with upcoming birthdays
router.post('/clients/birthdays', authenticate, async (req, res) => {
    try {
        const { filters, searchConfig } = req.body.myData || {};
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        // Skip filters with "all" value
        const cleanFilters = { ...filters };
        Object.keys(cleanFilters).forEach(key => {
            if (cleanFilters[key] === 'all') {
                delete cleanFilters[key];
            }
        });

        // Base query for clients with birthday data
        let query = {
            birthday: { $exists: true, $ne: null },
            ...cleanFilters
        };

        // Handle search functionality
        if (searchConfig && searchConfig.searchTerm && searchConfig.searchableColumns?.length) {
            const searchTerm = searchConfig.searchTerm.trim();
            const searchConditions = searchConfig.searchableColumns.map(column => ({
                [column]: { $regex: searchTerm, $options: 'i' }
            }));

            if (searchConditions.length > 0) {
                query = {
                    ...query,
                    $or: searchConditions
                };
            }
        }

        // Get clients with birthdays
        const clients = await clientModel.find(query, {
            clientName: 1,
            birthday: 1,
            gender: 1,
            clientCode: 1,
            contactNumber: 1
        }).skip(offset * limit).limit(limit).lean();

        // Get membership details for these clients
        const clientCodes = clients.map(c => c.clientCode).filter(code => code);
        const memberships = await clientMembershipModel.find(
            { clientCode: { $in: clientCodes }, status: 'active' },
            { clientCode: 1, memberId: 1 }
        ).lean();

        // Create membership lookup
        const membershipMap = {};
        memberships.forEach(membership => {
            membershipMap[membership.clientCode] = membership.memberId;
        });

        // Format the response with age calculation
        const formattedClients = clients.map((client, index) => {
            const birthdayDate = new Date(client.birthday * 1000);
            const today = new Date();
            let age = today.getFullYear() - birthdayDate.getFullYear();
            const monthDiff = today.getMonth() - birthdayDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdayDate.getDate())) {
                age--;
            }

            return {
                sno: index + 1,
                name: client.clientName,
                memberId: membershipMap[client.clientCode] || 'N/A',
                dob: client.birthday,
                age: age,
                gender: client.gender,
                contactNumber: client.contactNumber
            };
        });

        const total = await clientModel.countDocuments(query);

        return res.send({
            status: 'success',
            data: {
                records: formattedClients,
                totalData: total,
            },
            message: 'Client Birthdays Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in others route::/others/clients/birthdays", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

// Get clients with upcoming anniversaries
router.post('/clients/anniversaries', authenticate, async (req, res) => {
    try {
        const { filters, searchConfig } = req.body.myData || {};
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        // Skip filters with "all" value
        const cleanFilters = { ...filters };
        Object.keys(cleanFilters).forEach(key => {
            if (cleanFilters[key] === 'all') {
                delete cleanFilters[key];
            }
        });

        // Base query for clients with anniversary data
        let query = {
            anniversary: { $exists: true, $ne: null },
            ...cleanFilters
        };

        // Handle search functionality
        if (searchConfig && searchConfig.searchTerm && searchConfig.searchableColumns?.length) {
            const searchTerm = searchConfig.searchTerm.trim();
            const searchConditions = searchConfig.searchableColumns.map(column => ({
                [column]: { $regex: searchTerm, $options: 'i' }
            }));

            if (searchConditions.length > 0) {
                query = {
                    ...query,
                    $or: searchConditions
                };
            }
        }

        // Get clients with anniversaries
        const clients = await clientModel.find(query, {
            clientName: 1,
            anniversary: 1,
            gender: 1,
            clientCode: 1,
            contactNumber: 1
        }).skip(offset * limit).limit(limit).lean();

        // Get membership details for these clients
        const clientCodes = clients.map(c => c.clientCode).filter(code => code);
        const memberships = await clientMembershipModel.find(
            { clientCode: { $in: clientCodes }, status: 'active' },
            { clientCode: 1, memberId: 1 }
        ).lean();

        // Create membership lookup
        const membershipMap = {};
        memberships.forEach(membership => {
            membershipMap[membership.clientCode] = membership.memberId;
        });

        const formattedClients = clients.map((client, index) => {
            return {
                sno: index + 1,
                name: client.clientName,
                memberId: membershipMap[client.clientCode] || 'N/A',
                date: client.anniversary,
                gender: client.gender,
                contactNumber: client.contactNumber
            };
        });

        const total = await clientModel.countDocuments(query);

        return res.send({
            status: 'success',
            data: {
                records: formattedClients,
                totalData: total,
            },
            message: 'Client Anniversaries Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in others route::/others/clients/anniversaries", error);
        return res.status(500).send({
            message: 'Internal Server Error',
            status: 'error'
        });
    }
});

module.exports = router;