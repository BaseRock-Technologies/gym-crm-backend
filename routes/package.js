const express = require('express');
const { packageModel } = require('../models/package.model');
const { authenticate } = require('../helper/auth');
const { groupTheArrayOn } = require('../helper/steroids');

const router = express.Router();

router.post('/create', authenticate, async (req, res) => {
    try {
        const { packageName, packagePrice, durationInDays, status, maxDiscount, showOnWebsite, category = "default", } = req.body.myData;
        console.log(req.body.myData);
        const existingPackage = await packageModel.findOne({ package: packageName }).lean();
        if (existingPackage) {
            return res.send({ status: 'success', exists: true, message: "Package Already Exists" });
        }

        const data = {
            package: packageName,
            packagePrice,
            durationInDays,
            status,
            showOnWebsite,
            maxDiscount,
            category,
            createdBy: req.headers.userName,
        };
        await packageModel.create(data);
        return res.send({ status: 'success', exists: false, message: 'Package added successfully' });
    } catch (error) {
        console.log("Error in auth route::/package/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/options', authenticate, async (req, res) => {
    try {

        let packageDetails = await packageModel.find({ showOnWebsite: true }, { package: 1, category: 1 });
        packageDetails = groupTheArrayOn(packageDetails, "category");

        const data = {
            packageDetails,
        }
        return res.send({ status: 'success', data, message: 'Fetched successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/package/options", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;