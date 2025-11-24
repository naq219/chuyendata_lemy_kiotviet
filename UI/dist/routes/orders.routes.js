"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lemyde_service_1 = require("../services/lemyde.service");
const router = (0, express_1.Router)();
router.get('/orders', async (req, res) => {
    try {
        const orderIds = req.query.ids;
        let idsArray;
        if (orderIds) {
            idsArray = orderIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
        }
        const orders = await (0, lemyde_service_1.getOrders)(idsArray);
        res.json({ success: true, data: orders });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get('/order-details/:orderId', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const details = await (0, lemyde_service_1.getOrderDetails)(orderId);
        res.json({ success: true, data: details });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get('/customer/:customerId', async (req, res) => {
    try {
        const customerId = parseInt(req.params.customerId);
        const customer = await (0, lemyde_service_1.getCustomerById)(customerId);
        res.json({ success: true, data: customer });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get('/product/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const product = await (0, lemyde_service_1.getProductById)(productId);
        res.json({ success: true, data: product });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
