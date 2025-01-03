const express = require('express');

const router = express.Router();


const { authenticate } = require("../helper/auth");
const { clientModel } = require("../models/client.model");
const { clientSourceModel, packageModel, taxCategoryModel, paymentMethodModel } = require("../models/select.model");

router.post('/gym-bill', authenticate, async (req, res) => {
    try {
        const clientDetails = await clientModel.distinct("clientName");
        const contactNumbers = await clientModel.distinct("contactNumber");
        const clientDetailsMapped = clientDetails.map((name, index) => ({
            clientName: name,
            contactNumber: contactNumbers[index]
        }));
        const clientSourceDetails = await clientSourceModel.find({});
        const packageDetails = await packageModel.find({});
        const taxDetails = await taxCategoryModel.find({});
        const paymentMethod = await paymentMethodModel.find({});

        const billId = await clientModel.countDocuments();
        const data = {
            billId: billId + 1,
            clientDetails: clientDetailsMapped,
            clientSourceDetails,
            packageDetails,
            taxDetails,
            paymentMethod,
        }
        return res.send({ status: 'success', data, message: 'Fetched successfully' });
    } catch (error) {
        console.log("Error in auth route::/bills/gym-bill", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});
module.exports = router;