const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { productModel } = require('../models/product.model');

router.post('/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        data.createdBy = req.headers.userName;
        await productModel.create(data);
        return res.send({ status: 'success', message: 'Product created successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/product/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});


module.exports = router;