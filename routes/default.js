const express = require('express');
const { clientSourceModel, packageModel, paymentMethodModel, trainersModel, taxCategoryModel } = require('../models/select.model');

const router = express.Router();

router.post('/add-data', async (req, res) => {
    try {
        const data = {
            clientSource: {
                model: clientSourceModel,
                data: [
                    {
                        source: "client ref",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        source: "Flyer",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        source: "Hoarders",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        source: "Instagram",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        source: "Walk-In",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                ]
            },
            package: {
                model: packageModel,
                data: [
                    {
                        package: "12m",
                        price: 10000,
                        durationInDays: 365,
                        maxDiscount: 2000,
                        status: "active",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                        showOnWebsite: true,
                        category: "default",
                    },
                    {
                        package: "13m",
                        price: 7000,
                        durationInDays: 395,
                        maxDiscount: 1400,
                        status: "active",
                        createdBy: "Admin",
                        showOnWebsite: true,
                        category: "default",
                        createdAt: 1735866494,
                    },
                    {
                        package: "14m",
                        price: 10000,
                        durationInDays: 426,
                        maxDiscount: 2000,
                        status: "active",
                        createdBy: "Admin",
                        showOnWebsite: true,
                        category: "default",
                        createdAt: 1735866494,
                    },
                    {
                        package: "1m",
                        price: 11500,
                        durationInDays: 30,
                        maxDiscount: 2300,
                        status: "active",
                        createdBy: "Admin",
                        showOnWebsite: true,
                        category: "default",
                        createdAt: 1735866494,
                    },
                    {
                        package: "3m",
                        price: 5500,
                        durationInDays: 90,
                        maxDiscount: 1100,
                        status: "active",
                        createdBy: "Admin",
                        showOnWebsite: true,
                        category: "default",
                        createdAt: 1735866494,
                    },
                    {
                        package: "6m",
                        price: 8000,
                        durationInDays: 180,
                        maxDiscount: 1600,
                        status: "active",
                        createdBy: "Admin",
                        showOnWebsite: true,
                        category: "default",
                        createdAt: 1735866494,
                    },
                    {
                        package: "6m",
                        price: 8000,
                        durationInDays: 210,
                        maxDiscount: 1600,
                        status: "active",
                        createdBy: "Admin",
                        showOnWebsite: true,
                        category: "default",
                        createdAt: 1735866494,
                    },
                    {
                        package: "Annual Package",
                        price: 10000,
                        durationInDays: 365,
                        maxDiscount: 2000,
                        status: "active",
                        createdBy: "Admin",
                        showOnWebsite: true,
                        category: "default",
                        createdAt: 1735866494,
                    },
                    {
                        package: "Trial Pack",
                        price: 1000,
                        durationInDays: 6,
                        maxDiscount: 200,
                        status: "active",
                        createdBy: "Admin",
                        showOnWebsite: true,
                        category: "default",
                        createdAt: 1735866494,
                    },
                ]
            },
            tax: {
                model: taxCategoryModel,
                data: [
                    {
                        taxName: "No tax (0%)",
                        chargesPercentage: 0,
                        category: "default",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        taxName: "Goods and service tax (18%)",
                        chargesPercentage: 18,
                        category: "Exclusive Taxes",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        taxName: "Goods and service tax (18%)",
                        chargesPercentage: 18,
                        category: "Inclusive Taxes",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                ]
            },
            paymentMode: {
                model: paymentMethodModel,
                data: [
                    {
                        method: "Card",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        method: "Cash",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        method: "Cheque",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        method: "Online Payment",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        method: "Others",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        method: "Paytm",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        method: "Payumoney",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                    {
                        method: "UPI",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                ]
            },
            trainers: {
                model: trainersModel,
                data: [
                    {
                        trainer: "Hari",
                        createdBy: "Admin",
                        createdAt: 1735866494,
                    },
                ]
            },
        };

        for (const key in data) {
            const { model, data: entries } = data[key];
            await model.insertMany(entries);
        }

        return res.send({ status: 'success', message: 'Data added successfully' });
    } catch (error) {
        console.log("Error in /add-data route:", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
});

module.exports = router;