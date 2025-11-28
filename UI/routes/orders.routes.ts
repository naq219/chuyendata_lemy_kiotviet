// ============================================================================
// orders.routes.ts - Order Data Fetching Routes
// ============================================================================

import { Router, Request, Response } from 'express';
import { getOrders, getOrderDetails, getCustomerById, getProductById, updateOrderStatus, insertNccShip } from '../services/lemyde.service';

const router = Router();

/**
 * GET /api/orders
 * Fetches orders from Lemyde, optionally filtered by IDs
 */
router.get('/orders', async (req: Request, res: Response) => {
    try {
        const orderIds = req.query.ids as string;
        let idsArray: string[] | undefined;

        if (orderIds) {
            idsArray = orderIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
        }

        const orders = await getOrders(idsArray);
        console.log(orders);
        res.json({ success: true, data: orders });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/order-details/:orderId
 * Fetches order details for a specific order
 */
router.get('/order-details/:orderId', async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const details = await getOrderDetails(orderId);
        res.json({ success: true, data: details });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/customer/:customerId
 * Fetches customer data
 */
router.get('/customer/:customerId', async (req: Request, res: Response) => {
    try {
        const customerId = parseInt(req.params.customerId);
        const customer = await getCustomerById(customerId);
        res.json({ success: true, data: customer });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/product/:productId
 * Fetches product data
 */
router.get('/product/:productId', async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.productId);
        const product = await getProductById(productId);
        res.json({ success: true, data: product });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/change-order-status
 * Updates order status to 5 and dvvc to 10, then verifies the change
 */
router.post('/change-order-status', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            res.status(400).json({ success: false, error: 'Thiếu orderId trong request' });
            return;
        }

        const updatedOrder = await updateOrderStatus(parseInt(orderId));
        res.json({
            success: true,
            data: updatedOrder,
            message: `Đã cập nhật đơn hàng #${orderId} thành công. Status: ${updatedOrder.status}, DVVC: ${updatedOrder.dvvc}`
        });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/ncc-ship
 * Inserts NCC ship data into database
 */
router.post('/ncc-ship', async (req: Request, res: Response) => {
    try {
        console.log('=== NCC Ship Request Received ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const { order_id, ncc_orderid, ncc_bill_image, total_amount, money_received, free_ship, note, details } = req.body;

        // Validate required fields
        if (!order_id || !ncc_orderid || !ncc_bill_image) {
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

        const insertedRecord = await insertNccShip({
            order_id: parseInt(order_id),
            ncc_orderid,
            ncc_bill_image,
            total_amount: total_amount || 0,
            money_received: money_received || 0,
            free_ship: free_ship || 0,
            note: note || '',
            details: details || '{}',
        });

        console.log('✅ Insert successful, record:', insertedRecord);
        console.log('Sending response...');

        res.json({
            success: true,
            data: insertedRecord,
            message: `Đã thêm NCC ship cho đơn hàng #${order_id} thành công`
        });

        console.log('✅ Response sent successfully');
    } catch (error) {
        const err = error as Error;
        console.error('❌ Error in /ncc-ship route:');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
