"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const migration_service_1 = require("../services/migration.service");
const kiotviet_service_1 = require("../services/kiotviet.service");
const mapping_util_1 = require("../utils/mapping.util");
const router = (0, express_1.Router)();
console.log('🔄 Migration routes module loaded');
router.use((req, res, next) => {
    console.log(`🔄 Migration Route Hit: ${req.method} ${req.url}`);
    next();
});
router.post('/migrate-order', async (req, res) => {
    try {
        const { orderId, customerId, orderDetails, shopId, note, note_xuatkho } = req.body;
        const result = await (0, migration_service_1.migrateOrder)({
            orderId,
            customerId,
            orderDetails,
            shopId,
            note,
            note_xuatkho,
        });
        return res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error('Migration error:', error);
        const err = error;
        return res.status(500).json({ success: false, error: err.message });
    }
});
router.post('/remigrate-order', async (req, res) => {
    try {
        const { orderId, customerId, orderDetails, shopId, note, note_xuatkho } = req.body;
        const result = await (0, migration_service_1.remigrateOrder)(orderId, {
            customerId,
            orderDetails,
            shopId,
            note,
            note_xuatkho,
        });
        return res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error('Re-migration error:', error);
        const err = error;
        return res.status(500).json({ success: false, error: err.message });
    }
});
router.delete('/kiotviet/order/:kiotvietOrderId', async (req, res) => {
    try {
        const kiotvietOrderId = parseInt(req.params.kiotvietOrderId);
        await (0, kiotviet_service_1.deleteOrder)(kiotvietOrderId);
        return res.json({
            success: true,
            message: `Order ${kiotvietOrderId} deleted from KiotViet`,
        });
    }
    catch (error) {
        console.error('Delete order error:', error);
        const err = error;
        return res.status(500).json({ success: false, error: err.message });
    }
});
router.delete('/mapping/order/:orderId', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const mapping = (0, mapping_util_1.deleteOrderFromMapping)(orderId);
        return res.json({
            success: true,
            message: `Order ${orderId} removed from mapping`,
            data: mapping,
        });
    }
    catch (error) {
        console.error('Delete mapping error:', error);
        const err = error;
        return res.status(500).json({ success: false, error: err.message });
    }
});
router.get('/mapping', (req, res) => {
    const mapping = (0, mapping_util_1.loadMapping)();
    res.json({ success: true, data: mapping });
});
exports.default = router;
