const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { taxCategoryModel, clientModel, paymentMethodModel } = require("../models/others.model");
const { groupTheArrayOn, formatTimestamp } = require('../helper/steroids');
const { clientMembershipModel } = require('../models/membsrship.model');
const { posBill, posPurchase } = require('../models/pos.model');
const { productModel, vendorModel } = require('../models/product.model');

router.post('/bill/options', authenticate, async (req, res) => {
    try {
        let clientDetails = await clientModel.find({}, { clientName: 1, contactNumber: 1 });
        clientDetails = clientDetails.reduce((acc, val) => { acc.default.push({ clientName: `${val.clientName} (${val.contactNumber})` }); return acc; }, { default: [] })
        const paymentMethod = await paymentMethodModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });

        const groupedPaymentMethod = groupTheArrayOn(paymentMethod);

        const productDetails = await productModel.find({}, { productName: 1, productSalesPrice: 1 });
        const groupedProduct = groupTheArrayOn(productDetails)
        const invoiceNo = await posBill.find({}).countDocuments();
        const data = {
            invoiceNo: invoiceNo + 1,
            clientDetails,
            paymentMethod: groupedPaymentMethod,
            productDetails: groupedProduct,
        }
        return res.send({ status: 'success', data, message: 'Fetched successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/pos/biil/options", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/purchase/options', authenticate, async (req, res) => {
    try {
        let vendorDetails = await vendorModel.find({}, { vendorName: 1 });
        vendorDetails = vendorDetails.reduce((acc, val) => { acc.default.push(val); return acc; }, { default: [] })
        const paymentMethod = await paymentMethodModel.find({}, { createdAt: 0, createdBy: 0, __v: 0 });

        const groupedPaymentMethod = groupTheArrayOn(paymentMethod);

        const productDetails = await productModel.find({}, { productName: 1, productSalesPrice: 1 });
        const groupedProduct = groupTheArrayOn(productDetails)
        const data = {
            vendorDetails,
            paymentMethod: groupedPaymentMethod,
            productDetails: groupedProduct,
        }
        return res.send({ status: 'success', data, message: 'Fetched successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/pos/purchase/options", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/bill/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        data.createdBy = req.headers.userName;
        await posBill.create(data);
        return res.send({ status: 'success', data, message: 'Bill Created successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/pos/bill/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/purchase/create', authenticate, async (req, res) => {
    try {
        const data = req.body.myData;
        if (!data.purchaseDate) {
            data.purchaseDate = Math.floor(new Date().getTime() / 1000);
        }
        data.createdBy = req.headers.userName;
        await posPurchase.create(data);
        return res.send({ status: 'success', data, message: 'Purchase Added successfully' });
    } catch (error) {
        console.log("Error in auth route::POST::/pos/purchase/create", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

router.post('/purchase/records', authenticate, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const { filters, searchConfig } = req.body.myData;
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

        const validFields = Object.keys(posPurchase.schema.paths);
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

        const purchaseHistory = await posPurchase.find(finalQuery, { __v: 0 })
            .skip(offset * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedPurchaseHistory = purchaseHistory.map((purchase, index) => ({
            vendorName: purchase.vendorName,
            invoiceByVendor: purchase.invoiceByVendor,
            purchaseDate: purchase.purchaseDate,
            totalCharges: purchase.totalCharges,
            paymentMode: purchase.paymentMode,
        }));

        const total = await posPurchase.countDocuments(finalQuery);

        return res.send({
            status: 'success',
            data: {
                records: formattedPurchaseHistory,
                totalData: total,
            },
            message: 'Purchase History Fetched Successfully'
        });
    } catch (error) {
        console.log("Error in auth route::POST::/pos.purchase/records", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});


module.exports = router;