const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { productModel, vendorModel } = require('../models/product.model');

router.post('/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        data.createdBy = req.headers.userName;
        const isProductExists = await productModel.find({ productBarcode: data.productBarcode });
        if (isProductExists.length) {
            return res.send({ status: "info", exists: true, message: "Product Already exists" });
        }
        await productModel.create(data);
        return res.send({ status: 'success', message: 'Product created successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/product/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/vendor/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        data.createdBy = req.headers.userName;
        await vendorModel.create(data);
        return res.send({ status: 'success', message: 'Vendor created successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/product/vendor/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters, searchConfig, category } = req.body.myData;
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

        const validFields = Object.keys(productModel.schema.paths);
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

        if (category) {
            if (category === "out-of-stock") {
                finalQuery.manageInventory = true
            } else if (category === "in-stock") {
                finalQuery.manageInventory = false
            }
        }

        const productHistory = await productModel.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedProductHistory = productHistory.map((product, index) => ({
            sno: index + 1,
            productName: product.productName,
            itemInStock: product.itemInStock,
        }));

        const total = await productModel.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedProductHistory,
                totalData: total,
            },
            message: 'Product History Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in auth route::POST::/pos.purchase/records", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});


module.exports = router;