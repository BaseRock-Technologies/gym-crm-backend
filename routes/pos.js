const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { taxCategoryModel, clientModel, paymentMethodModel } = require("../models/others.model");
const { groupTheArrayOn } = require('../helper/steroids');
const { clientMembershipModel } = require('../models/client.model');
const { posBill } = require('../models/pos.model');
const { productModel } = require('../models/product.model');

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


module.exports = router;