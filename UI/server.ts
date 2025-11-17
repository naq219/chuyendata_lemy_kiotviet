// ============================================================================
// server.ts - Express.js Backend
// ============================================================================

import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// import validateMappingRouter from './routes/validate_mapping';
// import setKiotVietClient from './routes/validate_mapping';
// import { setKiotVietClient,validateMappingRouter } from './routes/validate_mapping';

import { createValidateRouter } from './validate_mapping';





// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const LEMYDE_API_URL = process.env.LEMYDE_API_URL || 'http://connect.lemyde.com';
const DATA_DIR = './data';
const MAPPING_FILE = path.join(DATA_DIR, 'migration_mapping.json');

interface MigrationMapping {
  customers: Record<number, number>;
  products: Record<number, number>;
  orders: Record<number, { kiotvietId: number; kiotvietCode: string }>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadMapping(): MigrationMapping {
  ensureDataDir();
  if (fs.existsSync(MAPPING_FILE)) {
    return JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
  }
  return { customers: {}, products: {}, orders: {} };
}

function saveMapping(mapping: MigrationMapping) {
  ensureDataDir();
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
}

// ============================================================================
// LEMYDE API CLIENT
// ============================================================================

async function lemydeQuery<T>(sql: string): Promise<T[]> {
  const response = await axios.get(LEMYDE_API_URL + '/get', {
    params: { sql },
  });

  if (response.data.status !== 1 || !response.data.data) {
    throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
  }

  return response.data.data as T[];
}

// ============================================================================
// ROUTES - FETCH
// ============================================================================

app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        o.id AS order_id,
        o.customer_id,
        o.date_created,
        o.shop_id,
        o.note,
        o.total_amount,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.address AS customer_address
      FROM crm.orders o
      JOIN crm.customers c ON o.customer_id = c.id
      WHERE o.status = 1
        AND o.id IN (
          SELECT DISTINCT do.order_id
          FROM crm.detail_orders do
          JOIN crm.products p ON do.product_id = p.id
          WHERE p.name LIKE '%nck1%'
        )
      ORDER BY o.id DESC limit 10
    `;

    const orders = await lemydeQuery<any>(sql);
    res.json({ success: true, data: orders });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/order-details/:orderId', async (req: Request, res: Response) => {
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

    const details = await lemydeQuery<any>(sql);
    res.json({ success: true, data: details });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/customer/:customerId', async (req: Request, res: Response) => {
  try {
    const customerId = req.params.customerId;

    const sql = `
      SELECT id AS customer_id, name, phone, address
      FROM crm.customers
      WHERE id = ${customerId}
    `;

    const [customer] = await lemydeQuery<any>(sql);
    res.json({ success: true, data: customer });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const sql = `
      SELECT id AS product_id, name, cost_price, retail_price, introduction
      FROM crm.products
      WHERE id = ${productId}
    `;

    const [product] = await lemydeQuery<any>(sql);
    res.json({ success: true, data: product });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// ROUTES - MIGRATE
// ============================================================================

const kiotvietClient = new KiotVietClient({
  clientId: process.env.KIOTVIET_CLIENT_ID!,
  clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
  retailerName: process.env.KIOTVIET_RETAILER_NAME!,
});

const validateRouter = createValidateRouter(kiotvietClient);
app.use( validateRouter);

let branchId = 1;

async function initBranchId() {
  try {
    const branches = await kiotvietClient.branches?.list?.({ pageSize: 100 });
    if (branches?.data && branches.data.length > 0) {
      branchId = branches.data[0].id;
    }
  } catch (error) {
    console.error('Failed to fetch branches, using default branchId=1');
  }
}

initBranchId();

app.post('/api/migrate-order', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, orderDetails,shopId } = req.body;
    const mapping = loadMapping();

   

    // Hard mapping shop_id từ Lemyde với saleChannelId của KiotViet
    const shopChannelMapping: Record<number, number> = {
      2: 228306,
      4: 228300,
      34: 229584,
      3: 228304,
      10: 228307
    };

    // Lấy saleChannelId từ mapping, mặc định là 0 nếu không tìm thấy
    const saleChannelId = shopId ? shopChannelMapping[shopId] || 0 : 0;

    // 1. Migrate customer if needed
    if (!mapping.customers[customerId]) {
      console.log('***** chưa có customerId', customerId);
      const customerSql = `SELECT name, phone, address FROM crm.customers WHERE id = ${customerId}`;
      const [customerData] = await lemydeQuery<any>(customerSql);

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
        
        // Xử lý cả hai trường hợp: response trực tiếp hoặc response có data wrapper
        let kiotvietCustomerId: number;
        
        // Kiểm tra nếu response có cấu trúc { message: "...", data: { id: ... } }
        if ('data' in createdCustomer && createdCustomer.data && typeof createdCustomer.data === 'object' && 'id' in createdCustomer.data) {
          // Response có data wrapper
          kiotvietCustomerId = (createdCustomer.data as any).id;
          console.log('***--- createdCustomer ID (from data wrapper):', kiotvietCustomerId);
        } else if ('id' in createdCustomer) {
          // Response trực tiếp: { id: ... } (theo type definition)
          kiotvietCustomerId = (createdCustomer as any).id;
          console.log('***--- createdCustomer ID (direct):', kiotvietCustomerId);
        } else {
          throw new Error('Cannot find customer ID in response: ' + JSON.stringify(createdCustomer));
        }

        mapping.customers[customerId] = kiotvietCustomerId;
        saveMapping(mapping); // Lưu mapping ngay sau khi tạo customer
        
      } catch (error: any) {
        // Nếu lỗi "Mã khách hàng đã tồn tại", tìm customer đã có và lấy ID
        if (error.errorMessage?.includes('Mã khách hàng') && error.errorMessage?.includes('đã tồn tại')) {
          console.log(`⚠️  Customer ${customerCode} đã tồn tại, đang tìm kiếm...`);
          
          // Tìm customer bằng code
          const existingCustomers = await kiotvietClient.customers.list({
            code: customerCode,
            pageSize: 1000
          });
          
          if (existingCustomers?.data && existingCustomers.data.length > 0) {
            const existingCustomer = existingCustomers.data[0];
            console.log(`✅ Đã tìm thấy customer tồn tại: ID = ${existingCustomer.id}`);
            
            mapping.customers[customerId] = existingCustomer.id;
            saveMapping(mapping);
          } else {
            console.error('❌ Không tìm thấy customer đã tồn tại với code:', customerCode);
            throw error;
          }
        } else {
          // Nếu là lỗi khác, throw lại
          throw error;
        }
      }
    }

    const kiotvietCustomerId = mapping.customers[customerId];
     
    // 2. Migrate products if needed
    for (const detail of orderDetails) {
      if (!mapping.products[detail.product_id]) {
       
        console.log('***** chưa có productId', detail.product_id);
        const productSql = `SELECT name, cost_price, retail_price, introduction FROM crm.products WHERE id = ${detail.product_id}`;
        const [productData] = await lemydeQuery<any>(productSql);

        const code = `LY${String(detail.product_id).padStart(6, '0')}`;

        try {
          const createdProduct = await kiotvietClient.products.create({
          name: productData.name,
          code,
          basePrice: productData.retail_price, // Giá bán
          description: productData.introduction || '',
          unit: 'Cái',
          categoryId: 1477260,
          inventories: [
            {
              branchId: branchId,
              cost: productData.cost_price, // Giá vốn
              onHand: 0
            }
          ]
        });

          console.log('***--- createdProduct', createdProduct.id);

          mapping.products[detail.product_id] = createdProduct.id;
        } catch (productError: any) {
          console.error(`Product ${code} error:`, productError.message);

          // If product already exists, try to find it
          if (productError.message?.includes('ProductId: 0')) {
            console.warn(`Product ${code} error, skipping...`);
            continue;
          }
          
          // Nếu lỗi "đã tồn tại", tìm product đã có và lấy ID
          if (productError.errorMessage?.includes('đã tồn tại')) {
            console.log(`⚠️  Product ${code} đã tồn tại, đang tìm kiếm...`);
            
            // Tìm product bằng code
            const existingProducts = await kiotvietClient.products.list({
              code: code,
              pageSize: 1000
            });
            
            if (existingProducts?.data && existingProducts.data.length > 0) {
              const existingProduct = existingProducts.data[0];
              console.log(`✅ Đã tìm thấy product tồn tại: ID = ${existingProduct.id}`);
              
              mapping.products[detail.product_id] = existingProduct.id;
            } else {
              console.error('❌ Không tìm thấy product đã tồn tại với code:', code);
              throw productError;
            }
          } else {
            // Nếu là lỗi khác, throw lại
            throw productError;
          }
        }
      }
    }
    
    // 3. Create order
    const transformedDetails = orderDetails.map((detail: any, index: number) => ({
      productId: mapping.products[detail.product_id],
      productCode: `LY${String(detail.product_id).padStart(6, '0')}`,
      productName: detail.product_name,
      quantity: detail.quantity,
      price: detail.gia_ban,
      isMaster: index === 0,
      discount: 0,
      discountRatio: 0,
    }));

    const createdOrder = await kiotvietClient.orders.create({
      branchId,
      customerId: kiotvietCustomerId,
      purchaseDate: new Date().toISOString(),
      orderDetails: transformedDetails,
      discount: 0,
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
  } catch (error) {
    console.error('Migration error:', error);
    const err = error as Error;
    console.error('Migration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/mapping', (req: Request, res: Response) => {
  const mapping = loadMapping();
  res.json({ success: true, data: mapping });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;