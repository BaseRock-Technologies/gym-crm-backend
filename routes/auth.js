const express = require('express');

const router = express.Router();

const { hashSync, compareSync } = require("bcrypt");
const { adminModel } = require('../models/admin.model');
const jwt = require("jsonwebtoken");

router.post('/signin', async (req, res) => {
    try {
        const { userName, password } = req.body.myData;

        if (!userName || !password) {
            return res.send({ message: 'Missing Required field(s)', status: 'error' });
        }

        const userData = await adminModel.findOne({ userName }).lean();
        if (!userData) {
            return res.send({ message: 'User Not found', status: 'error' });
        }

        const isValidPassword = compareSync(password, userData.hash);
        if (!isValidPassword) {
            return res.send({ message: 'access_denied', status: 'error' });
        }

        const data = { userName: userData.userName, password: userData.password };
        const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '1d' });

        return res.send({ status: 'success', message: 'Authentication successful', token });
    } catch (error) {
        console.log("Error in auth route::/signin", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/createAdmin', async (req, res) => {
    try {
        const { userName, password } = req.body.myData;
        const hash = hashSync(password, 12);
        await adminModel.insertMany({ userName, password, hash });
        return res.status(200).send({ status: 'success' });
    } catch (error) {
        console.log("Error in auth route::/createAdmin", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

module.exports = router;
