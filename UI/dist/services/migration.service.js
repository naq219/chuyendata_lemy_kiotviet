"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateCustomer = migrateCustomer;
exports.migrateProducts = migrateProducts;
exports.migrateOrder = migrateOrder;
exports.remigrateOrder = remigrateOrder;
const lemyde_service_1 = require("./lemyde.service");
const kiotviet_service_1 = require("./kiotviet.service");
const mapping_util_1 = require("../utils/mapping.util");
const constants_1 = require("../utils/constants");
async function migrateCustomer(customerId) {
    const mapping = (0, mapping_util_1.loadMapping)();
    if (mapping.customers[customerId]) {
        console.log('✅ Customer already migrated:', customerId);
        return mapping.customers[customerId];
    }
    console.log('***** Migrating customer', customerId);
    const customerData = await (0, lemyde_service_1.getCustomerById)(customerId);
    const kiotvietCustomerId = await (0, kiotviet_service_1.createOrFindCustomer)(customerData, customerId);
    mapping.customers[customerId] = kiotvietCustomerId;
    (0, mapping_util_1.saveMapping)(mapping);
    return kiotvietCustomerId;
}
async function migrateProducts(orderDetails) {
    const mapping = (0, mapping_util_1.loadMapping)();
    for (const detail of orderDetails) {
        if (mapping.products[detail.product_id]) {
            console.log('✅ Product already migrated:', detail.product_id);
            continue;
        }
        console.log('***** Migrating product', detail.product_id);
        const productData = await (0, lemyde_service_1.getProductById)(detail.product_id);
        const kiotvietProductId = await (0, kiotviet_service_1.createOrFindProduct)(productData, detail.product_id);
        mapping.products[detail.product_id] = kiotvietProductId;
        (0, mapping_util_1.saveMapping)(mapping);
    }
    return mapping;
}
async function migrateOrder(orderData) {
    const saleChannelId = orderData.shopId ? constants_1.SHOP_CHANNEL_MAPPING[orderData.shopId] || 0 : 0;
    if (!saleChannelId || saleChannelId === 0) {
        throw new Error('Cannot find shop mapping');
    }
    const kiotvietCustomerId = await migrateCustomer(orderData.customerId);
    const mapping = await migrateProducts(orderData.orderDetails);
    const transformedDetails = orderData.orderDetails.map(detail => ({
        ...detail,
        productId: mapping.products[detail.product_id],
    }));
    const createdOrder = await (0, kiotviet_service_1.createOrder)({
        customerId: kiotvietCustomerId,
        orderDetails: transformedDetails,
        shopId: orderData.shopId,
        note: orderData.note,
        note_xuatkho: orderData.note_xuatkho,
        orderId: orderData.orderId,
        saleChannelId,
    });
    mapping.orders[orderData.orderId] = {
        kiotvietId: createdOrder.id,
        kiotvietCode: createdOrder.code,
    };
    (0, mapping_util_1.saveMapping)(mapping);
    return {
        lemydeOrderId: orderData.orderId,
        kiotvietOrderId: createdOrder.id,
        kiotvietOrderCode: createdOrder.code,
    };
}
async function remigrateOrder(orderId, orderData) {
    const kiotvietOrderInfo = (0, mapping_util_1.getKiotVietOrderInfo)(orderId);
    if (!kiotvietOrderInfo) {
        throw new Error(`Order ${orderId} has not been migrated yet`);
    }
    console.log(`🔄 Starting re-migration for order ${orderId}`);
    console.log(`🗑️  Deleting KiotViet order ${kiotvietOrderInfo.kiotvietId}...`);
    await (0, kiotviet_service_1.deleteOrder)(kiotvietOrderInfo.kiotvietId);
    console.log(`📝 Removing order ${orderId} from mapping...`);
    (0, mapping_util_1.deleteOrderFromMapping)(orderId);
    console.log(`✨ Re-migrating order ${orderId}...`);
    const result = await migrateOrder({
        orderId,
        ...orderData,
    });
    console.log(`✅ Re-migration completed for order ${orderId}`);
    return result;
}
