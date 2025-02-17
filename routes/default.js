const express = require('express');
const { clientSourceModel, paymentMethodModel, trainersModel, taxCategoryModel } = require('../models/others.model');
const { packageModel } = require('../models/package.model');

const router = express.Router();

router.post('/add-data', async (req, res) => {
    try {
        const data = {
            // clientSource: {
            //     model: clientSourceModel,
            //     data: [
            //         {
            //             clientSource: "client ref",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             clientSource: "Flyer",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             clientSource: "Hoarders",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             clientSource: "Instagram",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             clientSource: "Walk-In",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //     ]
            // },
            // package: {
            //     model: packageModel,
            //     data: [
            //         {
            //             package: "12m",
            //             packagePrice: 10000,
            //             durationInDays: 365,
            //             maxDiscount: 2000,
            //             status: "active",
            //             createdBy: "Admin",
            //             createdAt: 1736847667,
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //         },
            //         {
            //             package: "13m",
            //             packagePrice: 7000,
            //             durationInDays: 395,
            //             maxDiscount: 1400,
            //             status: "active",
            //             createdBy: "Admin",
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //             createdAt: 1736847667,
            //         },
            //         {
            //             package: "14m",
            //             packagePrice: 10000,
            //             durationInDays: 426,
            //             maxDiscount: 2000,
            //             status: "active",
            //             createdBy: "Admin",
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //             createdAt: 1736847667,
            //         },
            //         {
            //             package: "1m",
            //             packagePrice: 11500,
            //             durationInDays: 30,
            //             maxDiscount: 2300,
            //             status: "active",
            //             createdBy: "Admin",
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //             createdAt: 1736847667,
            //         },
            //         {
            //             package: "3m",
            //             packagePrice: 5500,
            //             durationInDays: 90,
            //             maxDiscount: 1100,
            //             status: "active",
            //             createdBy: "Admin",
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //             createdAt: 1736847667,
            //         },
            //         {
            //             package: "6m",
            //             packagePrice: 8000,
            //             durationInDays: 180,
            //             maxDiscount: 1600,
            //             status: "active",
            //             createdBy: "Admin",
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //             createdAt: 1736847667,
            //         },
            //         {
            //             package: "6m",
            //             packagePrice: 8000,
            //             durationInDays: 210,
            //             maxDiscount: 1600,
            //             status: "active",
            //             createdBy: "Admin",
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //             createdAt: 1736847667,
            //         },
            //         {
            //             package: "Annual Package",
            //             packagePrice: 10000,
            //             durationInDays: 365,
            //             maxDiscount: 2000,
            //             status: "active",
            //             createdBy: "Admin",
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //             createdAt: 1736847667,
            //         },
            //         {
            //             package: "Trial Pack",
            //             packagePrice: 1000,
            //             durationInDays: 6,
            //             maxDiscount: 200,
            //             status: "active",
            //             createdBy: "Admin",
            //             showOnWebsite: true,
            //             category: "GYM Packages",
            //             createdAt: 1736847667,
            //         },
            //         {
            //             package: "12 PT Sessions",
            //             packagePrice: 0,
            //             durationInDays: 1,
            //             maxDiscount: 0,
            //             status: "active",
            //             createdBy: "Admin",
            //             createdAt: 1736847667,
            //             showOnWebsite: true,
            //             category: "PT Packages",
            //         },
            //         {
            //             package: "12M + PT",
            //             packagePrice: 0,
            //             durationInDays: 1,
            //             maxDiscount: 0,
            //             status: "active",
            //             createdBy: "Admin",
            //             createdAt: 1736847667,
            //             showOnWebsite: true,
            //             category: "PT Packages",
            //         },
            //         {
            //             package: "1M + PT",
            //             packagePrice: 0,
            //             durationInDays: 1,
            //             maxDiscount: 0,
            //             status: "active",
            //             createdBy: "Admin",
            //             createdAt: 1736847667,
            //             showOnWebsite: true,
            //             category: "PT Packages",
            //         },
            //         {
            //             package: "3M + PT",
            //             packagePrice: 0,
            //             durationInDays: 1,
            //             maxDiscount: 0,
            //             status: "active",
            //             createdBy: "Admin",
            //             createdAt: 1736847667,
            //             showOnWebsite: true,
            //             category: "PT Packages",
            //         },
            //         {
            //             package: "12sec-PT",
            //             packagePrice: 0,
            //             durationInDays: 1,
            //             maxDiscount: 0,
            //             status: "active",
            //             createdBy: "Admin",
            //             createdAt: 1736847667,
            //             showOnWebsite: true,
            //             category: "PT Packages",
            //         },
            //         {
            //             package: "3M + 12PT",
            //             packagePrice: 0,
            //             durationInDays: 1,
            //             maxDiscount: 0,
            //             status: "active",
            //             createdBy: "Admin",
            //             createdAt: 1736847667,
            //             showOnWebsite: true,
            //             category: "PT Packages",
            //         },
            //     ]
            // },
            // tax: {
            //     model: taxCategoryModel,
            //     data: [
            //         {
            //             taxName: "No tax (0%)",
            //             chargesPercentage: 0,
            //             category: "default",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             taxName: "Goods and service tax (18%)",
            //             chargesPercentage: 18,
            //             category: "Exclusive Taxes",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             taxName: "Goods and service tax (18%)",
            //             chargesPercentage: 18,
            //             category: "Inclusive Taxes",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //     ]
            // },
            // paymentMode: {
            //     model: paymentMethodModel,
            //     data: [
            //         {
            //             paymentMode: "Card",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             paymentMode: "Cash",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             paymentMode: "Cheque",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             paymentMode: "Online Payment",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             paymentMode: "Others",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             paymentMode: "Paytm",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             paymentMode: "Payumoney",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //         {
            //             paymentMode: "UPI",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //     ]
            // },
            // trainers: {
            //     model: trainersModel,
            //     data: [
            //         {
            //             trainer: "Hari",
            //             createdBy: "Admin",
            //             createdAt: 1735866494,
            //         },
            //     ]
            // },
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