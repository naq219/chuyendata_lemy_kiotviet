// ============================================================================
// orders.routes.ts - Order Data Fetching Routes
// ============================================================================

import { Router, Request, Response } from 'express';
import { getOrders, getOrderDetails, getCustomerById, getProductById } from '../services/lemyde.service';

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

export default router;
