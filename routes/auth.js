const express = require('express');

const router = express.Router();

const { hashSync, compareSync } = require("bcryptjs");
const { adminModel } = require('../models/admin.model');
const jwt = require("jsonwebtoken");
const { authModel, resetTokenModel } = require('../models/auth.model');
const { authenticate } = require('../helper/auth');

router.post('/signin', async (req, res) => {
    try {
        const { userName, password, role } = req.body.myData;

        if (!userName || !password) {
            return res.send({ message: 'Missing Required field(s)', status: 'error' });
        }

        const userData = await adminModel.findOne({ userName }).lean();
        if (!userData) {
            return res.send({ message: 'User Not found', status: 'error' });
        }

        const isValidPassword = compareSync(password, userData.hash);
        if (!isValidPassword) {
            return res.send({ message: 'Access Denied', status: 'unauthorized' });
        }

        const data = { userName: userData.userName, role: userData.role };
        const authToken = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '1d' });


        await authModel.findOneAndUpdate(
            { userName: userData.userName },
            { $set: { authToken, createdAt: new Date() } },
            { upsert: true },
        );

        return res.send({ status: 'success', message: 'Authentication successful', authToken, role: userData.role });
    } catch (error) {
        console.log("Error in auth route::/signin", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email, mobile } = req.body.myData;

        if (!email && !mobile) {
            return res.send({ message: 'Missing Required field(s)', status: 'error' });
        }

        let query = {};
        if (email) query.email = email;
        if (mobile) query.mobile = mobile;

        if (!Object.keys(query).length) {
            return res.send({ message: 'Missing Field(s)', status: 'error' });
        }

        const userData = await adminModel.findOne(query).lean();
        if (!userData) {
            return res.send({ message: 'User Not found', status: 'error' });
        }

        const resetToken = jwt.sign(req.body.myData, process.env.RESET_SECRET_KEY, { expiresIn: '1d' });

        await resetTokenModel.findOneAndUpdate(
            { userName: userData.userName },
            { $set: { resetToken, createdAt: new Date() } },
            { upsert: true },
        );

        // TODO: do the sms send function
        return res.send({ status: 'success', message: 'Email Sent successfully' });


    } catch (error) {
        console.log("Error in auth route::/forgot-password", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body.myData;

        if (!token && !password) {
            return res.send({ message: 'Missing Required field(s)', status: 'error' });
        }


        const resetData = await resetTokenModel.findOne({ resetToken: token }).lean();
        if (!resetData) {
            return res.send({ message: 'Invalid Token', status: 'error' });
        }

        const hash = hashSync(password, 12);

        await adminModel.findOneAndUpdate(
            { userName: resetData.userName },
            { $set: { hash, updatedAt: Math.floor(new Date().getTime() / 1000) } },
            { upsert: true },
        );

        // TODO: do the sms send function
        return res.send({ status: 'success', message: 'Password reset successfully' });


    } catch (error) {
        console.log("Error in auth route::/reset-password", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/createAdmin', async (req, res) => {
    try {
        const { userName, password, role, email, mobile } = req.body.myData;
        const hash = hashSync(password, 12);
        await adminModel.insertMany({ userName, role, hash, email, mobile });
        return res.status(200).send({ status: 'success' });
    } catch (error) {
        console.log("Error in auth route::/createAdmin", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

module.exports = router;
