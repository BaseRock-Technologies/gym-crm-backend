const express = require('express');
const { authenticate } = require('../helper/auth');
const { clientModel } = require('../models/select.model');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const { clientName, contactNumber, email } = req.body.myData
        const data = {
            clientName,
            contactNumber,
            email,
            createdBy: req.headers.userName,
        }
        await clientModel.create(data)
        return res.send({ status: 'success', message: 'Client Created Successfully' });
    } catch (error) {
        console.log("Error in auth route::/cilents/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;