// ============================================================================
// kiotviet.service.ts - KiotViet Operations Service
// ============================================================================

import { KiotVietClient } from 'kiotviet-client-sdk';
import { KIOTVIET_CONFIG, PRODUCT_CONFIG, CODE_PATTERNS } from '../utils/constants';

// KiotViet client singleton
let kiotvietClient: KiotVietClient;
let branchId = 1;

/**
 * Initializes KiotViet client
 */
export function initKiotVietClient(): KiotVietClient {
    if (!kiotvietClient) {
        kiotvietClient = new KiotVietClient({
            clientId: KIOTVIET_CONFIG.CLIENT_ID,
            clientSecret: KIOTVIET_CONFIG.CLIENT_SECRET,
            retailerName: KIOTVIET_CONFIG.RETAILER_NAME,
        });
    }
    return kiotvietClient;
}

/**
 * Initializes and returns branch ID
 */
export async function initBranchId(): Promise<number> {
    try {
        const client = initKiotVietClient();
        const branches = await client.branches?.list?.({ pageSize: 100 });
        if (branches?.data && branches.data.length > 0 && branches.data[0]?.id) {
            branchId = branches.data[0].id;
        }
    } catch (error) {
        console.error('Failed to fetch branches, using default branchId=1');
    }
    return branchId;
}

/**
 * Gets current branch ID
 */
export function getBranchId(): number {
    return branchId;
}

/**
 * Creates a customer or finds existing one if already exists
 * @param customerData - Customer data from Lemyde
 * @param customerId - Lemyde customer ID
 * @returns KiotViet customer ID
 */
export async function createOrFindCustomer(customerData: any, customerId: number): Promise<number> {
    const client = initKiotVietClient();
    const customerCode = `${CODE_PATTERNS.CUSTOMER_PREFIX}${String(customerId).padStart(CODE_PATTERNS.CUSTOMER_PADDING, '0')}`;

    try {
        const createdCustomer = await client.customers.create({
            name: customerData.name,
            code: customerCode,
            contactNumber: customerData.phone,
            address: customerData.address || '',
            branchId,
        });

        console.log('***--- createdCustomer FULL RESPONSE:', JSON.stringify(createdCustomer, null, 2));

        // Handle both response formats: direct or with data wrapper
        let kiotvietCustomerId: number;

        if ('data' in createdCustomer && createdCustomer.data && typeof createdCustomer.data === 'object' && 'id' in createdCustomer.data) {
            kiotvietCustomerId = (createdCustomer.data as any).id;
            console.log('***--- createdCustomer ID (from data wrapper):', kiotvietCustomerId);
        } else if ('id' in createdCustomer) {
            kiotvietCustomerId = (createdCustomer as any).id;
            console.log('***--- createdCustomer ID (direct):', kiotvietCustomerId);
        } else {
            throw new Error('Cannot find customer ID in response: ' + JSON.stringify(createdCustomer));
        }

        return kiotvietCustomerId;

    } catch (error: any) {
        // If customer already exists, find it
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
                } else {
                    throw new Error('Customer exists but has no ID');
                }
            } else {
                throw new Error(`Cannot find customer with code: ${customerCode}`);
            }
        } else {
            throw error;
        }
    }
}

/**
 * Creates a product or finds existing one if already exists
 * @param productData - Product data from Lemyde
 * @param productId - Lemyde product ID
 * @returns KiotViet product ID
 */
export async function createOrFindProduct(productData: any, productId: number): Promise<number> {
    const client = initKiotVietClient();
    const code = `${CODE_PATTERNS.PRODUCT_PREFIX}${String(productId).padStart(CODE_PATTERNS.PRODUCT_PADDING, '0')}`;

    try {
        // Process images from Lemyde
        let kiotvietImages: string[] = [];
        if (productData.images) {
            try {
                const images = JSON.parse(productData.images);
                if (Array.isArray(images)) {
                    kiotvietImages = images.map((imageName: string) =>
                        `${PRODUCT_CONFIG.IMAGES_BASE_URL}${imageName}`
                    );
                    console.log(`✅ Processed ${kiotvietImages.length} images for product ${productId}`);
                }
            } catch (parseError) {
                console.warn(`⚠️  Error parsing images for product ${productId}:`, productData.images);
            }
        }

        const createdProduct = await client.products.create({
            name: productData.name,
            code,
            basePrice: productData.retail_price,
            description: productData.introduction || '',
            unit: PRODUCT_CONFIG.DEFAULT_UNIT,
            allowsSale: true,
            categoryId: PRODUCT_CONFIG.CATEGORY_ID,
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

    } catch (productError: any) {
        console.error(`Product ${code} error:`, productError.message);

        if (productError.message?.includes('ProductId: 0')) {
            console.warn(`Product ${code} error, skipping...`);
            throw new Error(`Product ${code} - pp${productId} already exists`);
        }

        if (productError.errorMessage?.includes('đã tồn tại')) {
            console.log(`⚠️  Product ${code} already exists`);
            throw new Error(`Product ${code} already exists`);
        } else {
            throw productError;
        }
    }
}

/**
 * Creates an order in KiotViet
 * @param orderData - Order data including customer, products, etc.
 * @returns Created order with ID and code
 */
export async function createOrder(orderData: {
    customerId: number;
    orderDetails: any[];
    shopId: number;
    note?: string;
    note_xuatkho?: string;
    orderId: number;
    saleChannelId: number;
}) {
    const client = initKiotVietClient();

    // Merge duplicate products
    const productMap = new Map();

    orderData.orderDetails.forEach((detail: any) => {
        const productKey = detail.product_id;
        if (productMap.has(productKey)) {
            const existing = productMap.get(productKey);
            existing.quantity += detail.quantity;
        } else {
            productMap.set(productKey, {
                productId: detail.productId,
                productCode: `${CODE_PATTERNS.PRODUCT_PREFIX}${String(detail.product_id).padStart(CODE_PATTERNS.PRODUCT_PADDING, '0')}`,
                productName: detail.product_name,
                quantity: detail.quantity,
                price: detail.gia_ban,
                discount: 0,
                discountRatio: 0,
            });
        }
    });

    // Convert Map to array and set isMaster for first item
    const transformedDetails = Array.from(productMap.values()).map((detail, index) => ({
        ...detail,
        isMaster: index === 0,
    }));

    const description = `${CODE_PATTERNS.ORDER_PREFIX}${orderData.orderId ?? ''}. ${orderData.note ?? ''} ${orderData.note_xuatkho ?? ''}`;

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

/**
 * Deletes an order from KiotViet
 * @param kiotvietOrderId - KiotViet order ID to delete
 * @returns True if successful
 */
export async function deleteOrder(kiotvietOrderId: number): Promise<boolean> {
    const client = initKiotVietClient();

    try {
        await client.orders.delete(kiotvietOrderId);
        console.log(`✅ Deleted KiotViet order ${kiotvietOrderId}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to delete KiotViet order ${kiotvietOrderId}:`, error.message);
        throw new Error(`Cannot delete KiotViet order ${kiotvietOrderId}: ${error.message}`);
    }
}
