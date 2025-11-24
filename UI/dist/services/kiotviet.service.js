"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initKiotVietClient = initKiotVietClient;
exports.initBranchId = initBranchId;
exports.getBranchId = getBranchId;
exports.createOrFindCustomer = createOrFindCustomer;
exports.createOrFindProduct = createOrFindProduct;
exports.createOrder = createOrder;
exports.deleteOrder = deleteOrder;
const kiotviet_client_sdk_1 = require("kiotviet-client-sdk");
const constants_1 = require("../utils/constants");
let kiotvietClient;
let branchId = 1;
function initKiotVietClient() {
    if (!kiotvietClient) {
        kiotvietClient = new kiotviet_client_sdk_1.KiotVietClient({
            clientId: constants_1.KIOTVIET_CONFIG.CLIENT_ID,
            clientSecret: constants_1.KIOTVIET_CONFIG.CLIENT_SECRET,
            retailerName: constants_1.KIOTVIET_CONFIG.RETAILER_NAME,
        });
    }
    return kiotvietClient;
}
async function initBranchId() {
    try {
        const client = initKiotVietClient();
        const branches = await client.branches?.list?.({ pageSize: 100 });
        if (branches?.data && branches.data.length > 0 && branches.data[0]?.id) {
            branchId = branches.data[0].id;
        }
    }
    catch (error) {
        console.error('Failed to fetch branches, using default branchId=1');
    }
    return branchId;
}
function getBranchId() {
    return branchId;
}
async function createOrFindCustomer(customerData, customerId) {
    const client = initKiotVietClient();
    const customerCode = `${constants_1.CODE_PATTERNS.CUSTOMER_PREFIX}${String(customerId).padStart(constants_1.CODE_PATTERNS.CUSTOMER_PADDING, '0')}`;
    try {
        const createdCustomer = await client.customers.create({
            name: customerData.name,
            code: customerCode,
            contactNumber: customerData.phone,
            address: customerData.address || '',
            branchId,
        });
        console.log('***--- createdCustomer FULL RESPONSE:', JSON.stringify(createdCustomer, null, 2));
        let kiotvietCustomerId;
        if ('data' in createdCustomer && createdCustomer.data && typeof createdCustomer.data === 'object' && 'id' in createdCustomer.data) {
            kiotvietCustomerId = createdCustomer.data.id;
            console.log('***--- createdCustomer ID (from data wrapper):', kiotvietCustomerId);
        }
        else if ('id' in createdCustomer) {
            kiotvietCustomerId = createdCustomer.id;
            console.log('***--- createdCustomer ID (direct):', kiotvietCustomerId);
        }
        else {
            throw new Error('Cannot find customer ID in response: ' + JSON.stringify(createdCustomer));
        }
        return kiotvietCustomerId;
    }
    catch (error) {
        if (error.errorMessage?.includes('Mã khách hàng') && error.errorMessage?.includes('đã tồn tại')) {
            console.log(`⚠️  Customer ${customerCode} already exists, searching...`);
            const existingCustomers = await client.customers.list({
                code: customerCode,
                pageSize: 1000
            });
            if (existingCustomers?.data && existingCustomers.data.length > 0) {
                const existingCustomer = existingCustomers.data[0];
                if (existingCustomer?.id) {
                    console.log(`✅ Found existing customer: ID = ${existingCustomer.id}`);
                    return existingCustomer.id;
                }
                else {
                    throw new Error('Customer exists but has no ID');
                }
            }
            else {
                throw new Error(`Cannot find customer with code: ${customerCode}`);
            }
        }
        else {
            throw error;
        }
    }
}
async function createOrFindProduct(productData, productId) {
    const client = initKiotVietClient();
    const code = `${constants_1.CODE_PATTERNS.PRODUCT_PREFIX}${String(productId).padStart(constants_1.CODE_PATTERNS.PRODUCT_PADDING, '0')}`;
    try {
        let kiotvietImages = [];
        if (productData.images) {
            try {
                const images = JSON.parse(productData.images);
                if (Array.isArray(images)) {
                    kiotvietImages = images.map((imageName) => `${constants_1.PRODUCT_CONFIG.IMAGES_BASE_URL}${imageName}`);
                    console.log(`✅ Processed ${kiotvietImages.length} images for product ${productId}`);
                }
            }
            catch (parseError) {
                console.warn(`⚠️  Error parsing images for product ${productId}:`, productData.images);
            }
        }
        const createdProduct = await client.products.create({
            name: productData.name,
            code,
            basePrice: productData.retail_price,
            description: productData.introduction || '',
            unit: constants_1.PRODUCT_CONFIG.DEFAULT_UNIT,
            allowsSale: true,
            categoryId: constants_1.PRODUCT_CONFIG.CATEGORY_ID,
            images: kiotvietImages,
            inventories: [
                {
                    branchId: branchId,
                    cost: productData.cost_price,
                    onHand: 0
                }
            ]
        });
        console.log('***--- createdProduct', createdProduct.id);
        return createdProduct.id;
    }
    catch (productError) {
        console.error(`Product ${code} error:`, productError.message);
        if (productError.message?.includes('ProductId: 0')) {
            console.warn(`Product ${code} error, skipping...`);
            throw new Error(`Product ${code} - pp${productId} already exists`);
        }
        if (productError.errorMessage?.includes('đã tồn tại')) {
            console.log(`⚠️  Product ${code} already exists`);
            throw new Error(`Product ${code} already exists`);
        }
        else {
            throw productError;
        }
    }
}
async function createOrder(orderData) {
    const client = initKiotVietClient();
    const productMap = new Map();
    orderData.orderDetails.forEach((detail) => {
        const productKey = detail.product_id;
        if (productMap.has(productKey)) {
            const existing = productMap.get(productKey);
            existing.quantity += detail.quantity;
        }
        else {
            productMap.set(productKey, {
                productId: detail.productId,
                productCode: `${constants_1.CODE_PATTERNS.PRODUCT_PREFIX}${String(detail.product_id).padStart(constants_1.CODE_PATTERNS.PRODUCT_PADDING, '0')}`,
                productName: detail.product_name,
                quantity: detail.quantity,
                price: detail.gia_ban,
                discount: 0,
                discountRatio: 0,
            });
        }
    });
    const transformedDetails = Array.from(productMap.values()).map((detail, index) => ({
        ...detail,
        isMaster: index === 0,
    }));
    const description = `${constants_1.CODE_PATTERNS.ORDER_PREFIX}${orderData.orderId ?? ''}. ${orderData.note ?? ''} ${orderData.note_xuatkho ?? ''}`;
    const createdOrder = await client.orders.create({
        branchId,
        customerId: orderData.customerId,
        purchaseDate: new Date().toISOString(),
        orderDetails: transformedDetails,
        discount: 0,
        description: description,
        saleChannelId: orderData.saleChannelId,
    });
    console.log('***--- createdOrder', createdOrder.id);
    return createdOrder;
}
async function deleteOrder(kiotvietOrderId) {
    const client = initKiotVietClient();
    try {
        await client.orders.delete(kiotvietOrderId);
        console.log(`✅ Deleted KiotViet order ${kiotvietOrderId}`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to delete KiotViet order ${kiotvietOrderId}:`, error.message);
        throw new Error(`Cannot delete KiotViet order ${kiotvietOrderId}: ${error.message}`);
    }
}
