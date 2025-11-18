"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const kiotviet_client_sdk_1 = require("kiotviet-client-sdk");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
const LEMYDE_API_URL = process.env.LEMYDE_API_URL || 'http://connect.lemyde.com';
const DATA_DIR = './data';
const MAPPING_FILE = path.join(DATA_DIR, 'migration_mapping.json');
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}
function loadMapping() {
    ensureDataDir();
    if (fs.existsSync(MAPPING_FILE)) {
        const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
        if (!mapping.orders)
            mapping.orders = {};
        if (!mapping.customers)
            mapping.customers = {};
        if (!mapping.products)
            mapping.products = {};
        return mapping;
    }
    return { customers: {}, products: {}, orders: {} };
}
function saveMapping(mapping) {
    ensureDataDir();
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
}
async function lemydeQuery(sql) {
    const response = await axios_1.default.get(LEMYDE_API_URL + '/get', {
        params: { sql },
    });
    if (response.data.status !== 1 || !response.data.data) {
        throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
    }
    return response.data.data;
}
app.get('/api/orders', async (req, res) => {
    try {
        const sql = `
      SELECT 
        o.id AS order_id,
        o.customer_id,
        o.date_created,
        o.shop_id,
        o.note,
        c.note_xuatkho,
        o.total_amount,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.address AS customer_address,
        (
          SELECT JSON_ARRAYAGG(p.images) 
          FROM crm.detail_orders do
          JOIN crm.products p ON do.product_id = p.id
          WHERE do.order_id = o.id
        ) AS images
      FROM crm.orders o
      JOIN crm.customers c ON o.customer_id = c.id
      WHERE o.status = 1
        AND o.id IN (
          SELECT DISTINCT do.order_id
          FROM crm.detail_orders do
          JOIN crm.products p ON do.product_id = p.id
          WHERE p.name LIKE '%nck1%'
        )
      ORDER BY o.id DESC 
    `;
        const orders = await lemydeQuery(sql);
        res.json({ success: true, data: orders });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
app.get('/api/order-details/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const sql = `
      SELECT 
        do.id AS detail_order_id,
        do.product_id,
        p.name AS product_name,
        p.cost_price,
        p.retail_price,
        do.quantity,
        do.gia_ban,
        do.gia_nhap
      FROM crm.detail_orders do
      JOIN crm.products p ON do.product_id = p.id
      WHERE do.order_id = ${orderId}
      ORDER BY do.id 
    `;
        const details = await lemydeQuery(sql);
        res.json({ success: true, data: details });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
app.get('/api/customer/:customerId', async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const sql = `
      SELECT id AS customer_id, name, phone, address
      FROM crm.customers
      WHERE id = ${customerId}
    `;
        const [customer] = await lemydeQuery(sql);
        res.json({ success: true, data: customer });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
app.get('/api/product/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const sql = `
      SELECT id AS product_id, name, cost_price, retail_price, introduction
      FROM crm.products
      WHERE id = ${productId}
    `;
        const [product] = await lemydeQuery(sql);
        res.json({ success: true, data: product });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ success: false, error: err.message });
    }
});
const kiotvietClient = new kiotviet_client_sdk_1.KiotVietClient({
    clientId: process.env.KIOTVIET_CLIENT_ID,
    clientSecret: process.env.KIOTVIET_CLIENT_SECRET,
    retailerName: process.env.KIOTVIET_RETAILER_NAME,
});
let branchId = 1;
async function initBranchId() {
    try {
        const branches = await kiotvietClient.branches?.list?.({ pageSize: 100 });
        if (branches?.data && branches.data.length > 0) {
            branchId = branches.data[0].id;
        }
    }
    catch (error) {
        console.error('Failed to fetch branches, using default branchId=1');
    }
}
initBranchId();
app.post('/api/migrate-order', async (req, res) => {
    try {
        const { orderId, customerId, orderDetails, shopId, note, note_xuatkho } = req.body;
        const mapping = loadMapping();
        const shopChannelMapping = {
            2: 228306,
            4: 228300,
            34: 229584,
            3: 228304,
            10: 228307
        };
        const saleChannelId = shopId ? shopChannelMapping[shopId] || 0 : 0;
        if (!saleChannelId || saleChannelId === 0) {
            return res.status(400).json({ success: false, error: 'Không tìm thấy shop ' });
        }
        if (!mapping.customers[customerId]) {
            console.log('***** chưa có customerId', customerId);
            const customerSql = `SELECT name, phone, address FROM crm.customers WHERE id = ${customerId}`;
            const [customerData] = await lemydeQuery(customerSql);
            const customerCode = `LY${String(customerId).padStart(6, '0')}`;
            try {
                const createdCustomer = await kiotvietClient.customers.create({
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
                mapping.customers[customerId] = kiotvietCustomerId;
                saveMapping(mapping);
            }
            catch (error) {
                if (error.errorMessage?.includes('Mã khách hàng') && error.errorMessage?.includes('đã tồn tại')) {
                    console.log(`⚠️  Customer ${customerCode} đã tồn tại, đang tìm kiếm...`);
                    const existingCustomers = await kiotvietClient.customers.list({
                        code: customerCode,
                        pageSize: 1000
                    });
                    if (existingCustomers?.data && existingCustomers.data.length > 0) {
                        const existingCustomer = existingCustomers.data[0];
                        console.log(`✅ Đã tìm thấy customer tồn tại: ID = ${existingCustomer.id}`);
                        mapping.customers[customerId] = existingCustomer.id;
                        saveMapping(mapping);
                    }
                    else {
                        console.error('❌ Không tìm thấy customer đã tồn tại với code:', customerCode);
                        throw error;
                    }
                }
                else {
                    throw error;
                }
            }
        }
        const kiotvietCustomerId = mapping.customers[customerId];
        for (const detail of orderDetails) {
            if (!mapping.products[detail.product_id]) {
                console.log('***** chưa có productId', detail.product_id);
                const productSql = `SELECT name, cost_price, retail_price, introduction, images FROM crm.products WHERE id = ${detail.product_id}`;
                const [productData] = await lemydeQuery(productSql);
                const code = `MY${String(detail.product_id).padStart(6, '0')}`;
                try {
                    let kiotvietImages = [];
                    if (productData.images) {
                        try {
                            const images = JSON.parse(productData.images);
                            if (Array.isArray(images)) {
                                kiotvietImages = images.map((imageName) => `https://files.lemyde.com/uploads/${imageName}`);
                                console.log(`✅ Đã xử lý ${kiotvietImages.length} ảnh cho product ${detail.product_id}`);
                            }
                        }
                        catch (parseError) {
                            console.warn(`⚠️  Lỗi parse images cho product ${detail.product_id}:`, productData.images);
                        }
                    }
                    const createdProduct = await kiotvietClient.products.create({
                        name: productData.name,
                        code,
                        basePrice: productData.retail_price,
                        description: productData.introduction || '',
                        unit: 'Cái',
                        allowsSale: true,
                        categoryId: 1477260,
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
                    mapping.products[detail.product_id] = createdProduct.id;
                }
                catch (productError) {
                    console.error(`Product ${code} error:`, productError.message);
                    if (productError.message?.includes('ProductId: 0')) {
                        console.warn(`Product ${code} error, skipping...`);
                        continue;
                    }
                    if (productError.errorMessage?.includes('đã tồn tại')) {
                        console.log(`⚠️  Product ${code} đã tồn tại, đang tìm kiếm...`);
                        const existingProducts = await kiotvietClient.products.list({
                            code: code,
                            pageSize: 1000
                        });
                        if (existingProducts?.data && existingProducts.data.length > 0) {
                            const existingProduct = existingProducts.data[0];
                            console.log(`✅ Đã tìm thấy product tồn tại: ID = ${existingProduct.id}`);
                            mapping.products[detail.product_id] = existingProduct.id;
                        }
                        else {
                            console.error('❌ Không tìm thấy product đã tồn tại với code:', code);
                            throw productError;
                        }
                    }
                    else {
                        throw productError;
                    }
                }
            }
        }
        const productMap = new Map();
        orderDetails.forEach((detail) => {
            const productKey = detail.product_id;
            if (productMap.has(productKey)) {
                const existing = productMap.get(productKey);
                existing.quantity += detail.quantity;
            }
            else {
                productMap.set(productKey, {
                    productId: mapping.products[detail.product_id],
                    productCode: `MY${String(detail.product_id).padStart(6, '0')}`,
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
        let description = 'DHM' + (orderId ?? '') + '. ' + (note ?? '') + ' ' + (note_xuatkho ?? '');
        const customOrderCode = `DHM${orderId}`;
        const createdOrder = await kiotvietClient.orders.create({
            branchId,
            customerId: kiotvietCustomerId,
            purchaseDate: new Date().toISOString(),
            orderDetails: transformedDetails,
            discount: 0,
            description: description,
            saleChannelId: saleChannelId,
        });
        console.log('***--- createdOrder', createdOrder.id);
        mapping.orders[orderId] = {
            kiotvietId: createdOrder.id,
            kiotvietCode: createdOrder.code,
        };
        saveMapping(mapping);
        res.json({
            success: true,
            data: {
                lemydeOrderId: orderId,
                kiotvietOrderId: createdOrder.id,
                kiotvietOrderCode: createdOrder.code,
            },
        });
    }
    catch (error) {
        console.error('Migration error:', error);
        const err = error;
        console.error('Migration error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});
app.get('/api/mapping', (req, res) => {
    const mapping = loadMapping();
    res.json({ success: true, data: mapping });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
exports.default = app;
