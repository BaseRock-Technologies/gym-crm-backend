const express = require('express');
const { packageModel } = require('../models/package.model');
const { authenticate } = require('../helper/auth');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const { package, price, durationInDays, status, showOnWebsite } = req.body.myData;

        const existingPackage = await packageModel.findOne({ package });
        if (existingPackage) {
            return res.send({ status: 'success', exists: true, message: "Package Already Exists" });
        }

        const data = {
            package,
            price,
            durationInDays,
            status,
            showOnWebsite,
            maxDiscount: 2000,
            category: "default",
            createdBy: req.headers.userName,
        };
        await packageModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Package added successfully' });
    } catch (error) {
        console.log("Error in auth route::/package/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;