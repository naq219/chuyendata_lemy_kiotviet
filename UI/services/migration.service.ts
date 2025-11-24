// ============================================================================
// migration.service.ts - Migration Business Logic Service
// ============================================================================

import { getCustomerById, getProductById, lemydeQuery } from './lemyde.service';
import { createOrFindCustomer, createOrFindProduct, createOrder, deleteOrder, getBranchId } from './kiotviet.service';
import { loadMapping, saveMapping, deleteOrderFromMapping, getKiotVietOrderInfo, MigrationMapping } from '../utils/mapping.util';
import { SHOP_CHANNEL_MAPPING } from '../utils/constants';

/**
 * Migrates a customer to KiotViet
 * @param customerId - Lemyde customer ID
 * @returns KiotViet customer ID
 */
export async function migrateCustomer(customerId: number): Promise<number> {
    const mapping = loadMapping();

    // Check if already migrated
    if (mapping.customers[customerId]) {
        console.log('✅ Customer already migrated:', customerId);
        return mapping.customers[customerId];
    }

    console.log('***** Migrating customer', customerId);
    const customerData = await getCustomerById(customerId);
    const kiotvietCustomerId = await createOrFindCustomer(customerData, customerId);

    // Update and save mapping
    mapping.customers[customerId] = kiotvietCustomerId;
    saveMapping(mapping);

    return kiotvietCustomerId;
}

/**
 * Migrates products to KiotViet
 * @param orderDetails - Array of order detail items containing products
 * @returns Updated mapping
 */
export async function migrateProducts(orderDetails: any[]): Promise<MigrationMapping> {
    const mapping = loadMapping();

    for (const detail of orderDetails) {
        // Check if product already migrated
        if (mapping.products[detail.product_id]) {
            console.log('✅ Product already migrated:', detail.product_id);
            continue;
        }

        console.log('***** Migrating product', detail.product_id);
        const productData = await getProductById(detail.product_id);
        const kiotvietProductId = await createOrFindProduct(productData, detail.product_id);

        // Update and save mapping after each product
        mapping.products[detail.product_id] = kiotvietProductId;
        saveMapping(mapping);
    }

    return mapping;
}

/**
 * Migrates a complete order to KiotViet
 * @param orderData - Order migration data
 * @returns Migration result with KiotViet order info
 */
export async function migrateOrder(orderData: {
    orderId: number;
    customerId: number;
    orderDetails: any[];
    shopId: number;
    note?: string;
    note_xuatkho?: string;
}): Promise<{ lemydeOrderId: number; kiotvietOrderId: number; kiotvietOrderCode: string }> {

    // Validate shop channel mapping
    const saleChannelId = orderData.shopId ? SHOP_CHANNEL_MAPPING[orderData.shopId] || 0 : 0;
    if (!saleChannelId || saleChannelId === 0) {
        throw new Error('Cannot find shop mapping');
    }

    // Step 1: Migrate customer
    const kiotvietCustomerId = await migrateCustomer(orderData.customerId);

    // Step 2: Migrate products
    const mapping = await migrateProducts(orderData.orderDetails);

    // Step 3: Prepare order details with KiotViet product IDs
    const transformedDetails = orderData.orderDetails.map(detail => ({
        ...detail,
        productId: mapping.products[detail.product_id],
    }));

    // Step 4: Create order in KiotViet
    const createdOrder = await createOrder({
        customerId: kiotvietCustomerId,
        orderDetails: transformedDetails,
        shopId: orderData.shopId,
        note: orderData.note,
        note_xuatkho: orderData.note_xuatkho,
        orderId: orderData.orderId,
        saleChannelId,
    });

    // Step 5: Update mapping with order info
    mapping.orders[orderData.orderId] = {
        kiotvietId: createdOrder.id,
        kiotvietCode: createdOrder.code,
    };
    saveMapping(mapping);

    return {
        lemydeOrderId: orderData.orderId,
        kiotvietOrderId: createdOrder.id,
        kiotvietOrderCode: createdOrder.code,
    };
}

/**
 * Re-migrates an order (deletes from KiotViet and migrates again)
 * @param orderId - Lemyde order ID
 * @param orderData - Full order data for re-migration
 * @returns Migration result
 */
export async function remigrateOrder(
    orderId: number,
    orderData: {
        customerId: number;
        orderDetails: any[];
        shopId: number;
        note?: string;
        note_xuatkho?: string;
    }
): Promise<{ lemydeOrderId: number; kiotvietOrderId: number; kiotvietOrderCode: string }> {

    // Step 1: Get existing KiotViet order info
    const kiotvietOrderInfo = getKiotVietOrderInfo(orderId);
    if (!kiotvietOrderInfo) {
        throw new Error(`Order ${orderId} has not been migrated yet`);
    }

    console.log(`🔄 Starting re-migration for order ${orderId}`);

    // Step 2: Delete order from KiotViet
    console.log(`🗑️  Deleting KiotViet order ${kiotvietOrderInfo.kiotvietId}...`);
    await deleteOrder(kiotvietOrderInfo.kiotvietId);

    // Step 3: Remove from mapping
    console.log(`📝 Removing order ${orderId} from mapping...`);
    deleteOrderFromMapping(orderId);

    // Step 4: Migrate again
    console.log(`✨ Re-migrating order ${orderId}...`);
    const result = await migrateOrder({
        orderId,
        ...orderData,
    });

    console.log(`✅ Re-migration completed for order ${orderId}`);
    return result;
}
