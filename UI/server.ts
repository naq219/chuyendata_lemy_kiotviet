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
      ORDER BY o.id DESC
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
    const { orderId, customerId, orderDetails } = req.body;
    const mapping = loadMapping();

    // 1. Migrate customer if needed
    if (!mapping.customers[customerId]) {
      console.log('***** chưa có customerId', customerId);
      const customerSql = `SELECT name, phone, address FROM crm.customers WHERE id = ${customerId}`;
      const [customerData] = await lemydeQuery<any>(customerSql);

      const createdCustomer = await kiotvietClient.customers.create({
        name: customerData.name,
        code: `LY${String(customerId).padStart(6, '0')}`,
        contactNumber: customerData.phone,
        address: customerData.address || '',
        branchId,
      });

      console.log('***--- createdCustomer', createdCustomer.id);

      mapping.customers[customerId] = createdCustomer.id;
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
            basePrice: productData.cost_price,
            description: productData.introduction || '',
            unit: 'Cái',
            categoryId: 1477260,
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
          throw productError;
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