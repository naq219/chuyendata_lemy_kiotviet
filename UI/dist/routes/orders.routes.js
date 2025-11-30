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
        console.log(orders);
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
router.post('/change-order-status', async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            res.status(400).json({ success: false, error: 'Thiếu orderId trong request' });
            return;
        }
        const updatedOrder = await (0, lemyde_service_1.updateOrderStatus)(parseInt(orderId));
        res.json({
            success: true,
            data: updatedOrder,
            message: `Đã cập nhật đơn hàng #${orderId} thành công. Status: ${updatedOrder.status}, DVVC: ${updatedOrder.dvvc}`
        });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
router.post('/ncc-ship', async (req, res) => {
    try {
        const { order_id, ncc_orderid, ncc_bill_image, total_amount, money_received, free_ship, note, details, date_create_bill } = req.body;
        if (!order_id) {
            console.log('❌ Validation failed - missing required fields');
            res.status(400).json({
                success: false,
                error: 'Thiếu thông tin bắt buộc: order_id, ncc_orderid, ncc_bill_image'
            });
            return;
        }
        console.log('✅ Validation passed');
        console.log('Calling insertNccShip with data:', {
            order_id: parseInt(order_id),
            ncc_orderid,
            ncc_bill_image: ncc_bill_image.substring(0, 50) + '...',
            total_amount: total_amount || 0,
            money_received: money_received || 0,
            free_ship: free_ship || 0,
            note: note || '',
            details: details ? details.substring(0, 100) + '...' : '{}',
        });
        const insertedRecord = await (0, lemyde_service_1.insertNccShip)({
            order_id: parseInt(order_id),
            ncc_orderid,
            ncc_bill_image,
            total_amount: total_amount || 0,
            money_received: money_received || 0,
            free_ship: free_ship || 0,
            note: note || '',
            details: details || '{}',
            date_create_bill,
        });
        console.log('✅ Insert successful, record:', insertedRecord);
        console.log('Sending response...');
        res.json({
            success: true,
            data: insertedRecord,
            message: `Đã thêm NCC ship cho đơn hàng #${order_id} thành công`
        });
        console.log('✅ Response sent successfully');
    }
    catch (error) {
        const err = error;
        console.error('❌ Error in /ncc-ship route:');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
