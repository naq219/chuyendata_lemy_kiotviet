// ============================================================================
// migration.routes.ts - Migration Operation Routes
// ============================================================================

import { Router, Request, Response } from 'express';
import { migrateOrder, remigrateOrder } from '../services/migration.service';
import { deleteOrder } from '../services/kiotviet.service';
import { loadMapping, deleteOrderFromMapping } from '../utils/mapping.util';

const router = Router();

console.log('🔄 Migration routes module loaded');

router.use((req, res, next) => {
    console.log(`🔄 Migration Route Hit: ${req.method} ${req.url}`);
    next();
});

/**
 * POST /api/migrate-order
 * Migrates an order from Lemyde to KiotViet
 */
router.post('/migrate-order', async (req: Request, res: Response) => {
    try {
        const { orderId, customerId, orderDetails, shopId, note, note_xuatkho } = req.body;

        const result = await migrateOrder({
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
    } catch (error) {
        console.error('Migration error:', error);
        const err = error as Error;
        return res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/remigrate-order
 * Re-migrates an order (deletes from KiotViet and migrates again)
 */
router.post('/remigrate-order', async (req: Request, res: Response) => {
    try {
        const { orderId, customerId, orderDetails, shopId, note, note_xuatkho } = req.body;

        const result = await remigrateOrder(orderId, {
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
    } catch (error) {
        console.error('Re-migration error:', error);
        const err = error as Error;
        return res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * DELETE /api/kiotviet/order/:kiotvietOrderId
 * Deletes an order from KiotViet only
 */
router.delete('/kiotviet/order/:kiotvietOrderId', async (req: Request, res: Response) => {
    try {
        const kiotvietOrderId = parseInt(req.params.kiotvietOrderId);
        await deleteOrder(kiotvietOrderId);

        return res.json({
            success: true,
            message: `Order ${kiotvietOrderId} deleted from KiotViet`,
        });
    } catch (error) {
        console.error('Delete order error:', error);
        const err = error as Error;
        return res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * DELETE /api/mapping/order/:orderId
 * Removes an order from the mapping file
 */
router.delete('/mapping/order/:orderId', async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const mapping = deleteOrderFromMapping(orderId);

        return res.json({
            success: true,
            message: `Order ${orderId} removed from mapping`,
            data: mapping,
        });
    } catch (error) {
        console.error('Delete mapping error:', error);
        const err = error as Error;
        return res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/mapping
 * Returns current migration mapping
 */
router.get('/mapping', (req: Request, res: Response) => {
    const mapping = loadMapping();
    res.json({ success: true, data: mapping });
});

export default router;
