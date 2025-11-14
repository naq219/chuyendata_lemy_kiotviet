import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import pino from 'pino';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// TYPE DEFINITIONS & VALIDATION
// ============================================================================

const LemydeOrderSchema = z.object({
  order_id: z.number(),
  customer_id: z.number(),
  date_created: z.string(),
  note: z.string().nullable().optional(),
  total_amount: z.number(),
  customer_name: z.string(),
  customer_phone: z.string(),
  customer_address: z.string().nullable().optional(),
});

const LemydeDetailOrderSchema = z.object({
  detail_order_id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  product_name: z.string(),
  cost_price: z.number(),
  retail_price: z.number(),
  sku: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  introduction: z.string().nullable().optional(),
  quantity: z.number(),
  gia_ban: z.number(),
  gia_nhap: z.number(),
});

const LemydeCustomerSchema = z.object({
  customer_id: z.number(),
  name: z.string(),
  phone: z.string(),
  address: z.string().nullable().optional(),
});

const LemydeProductSchema = z.object({
  product_id: z.number(),
  name: z.string(),
  cost_price: z.number(),
  retail_price: z.number(),
  weight: z.number().nullable().optional(),
  introduction: z.string().nullable().optional(),
  spm_code: z.string().nullable().optional(),
});

type LemydeOrder = z.infer<typeof LemydeOrderSchema>;
type LemydeDetailOrder = z.infer<typeof LemydeDetailOrderSchema>;
type LemydeCustomer = z.infer<typeof LemydeCustomerSchema>;
type LemydeProduct = z.infer<typeof LemydeProductSchema>;

interface MigrationState {
  phase: 'fetch' | 'create-customers' | 'create-products' | 'create-orders' | 'complete';
  status: 'in-progress' | 'success' | 'failed';
  startTime: string;
  endTime?: string;

  statistics: {
    customers: { total: number; created: number };
    products: { total: number; created: number };
    orders: { total: number; created: number; failed: number };
  };

  mappings: {
    customers: Record<number, number>; // lemyde_id -> kiotviet_id
    products: Record<number, number>; // lemyde_id -> kiotviet_id
  };

  lastError?: {
    phase: string;
    message: string;
    detail?: string;
    timestamp: string;
  };
}

// ============================================================================
// LOGGER SETUP
// ============================================================================

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    },
  },
  pino.destination('./migration/logs.jsonl')
);

// ============================================================================
// LEMYDE API CLIENT
// ============================================================================

class LemydeClient {
  private axios: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.LEMYDE_API_URL || 'http://connect.lemyde.com';
    this.axios = axios.create({ baseURL: this.baseUrl });
    axiosRetry(this.axios, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
    });
  }

  async query<T>(sql: string): Promise<T[]> {
    try {
      const response = await this.axios.get('/get', {
        params: { sql },
      });

      if (response.data.status !== 1 || !response.data.data) {
        throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
      }

      return response.data.data as T[];
    } catch (error) {
      logger.error({ error, sql }, 'Lemyde query failed');
      throw error;
    }
  }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const STATE_DIR = './migration';
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const SKIPPED_FILE = path.join(STATE_DIR, 'skipped-products.jsonl');

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function loadState(): MigrationState {
  ensureStateDir();
  if (fs.existsSync(STATE_FILE)) {
    const data = fs.readFileSync(STATE_FILE, 'utf-8');
    
    // Check if file is empty or contains only whitespace
    if (data.trim().length === 0) {
      logger.warn('State file is empty, using default state');
      return getDefaultState();
    }
    
    try {
      return JSON.parse(data);
    } catch (error) {
      logger.warn({ error: (error as Error).message }, 'Failed to parse state file, using default state');
      return getDefaultState();
    }
  }

  return getDefaultState();
}

function getDefaultState(): MigrationState {
  return {
    phase: 'fetch',
    status: 'in-progress',
    startTime: new Date().toISOString(),
    statistics: {
      customers: { total: 0, created: 0 },
      products: { total: 0, created: 0 },
      orders: { total: 0, created: 0, failed: 0 },
    },
    mappings: {
      customers: {},
      products: {},
    },
  };
}

function saveState(state: MigrationState) {
  ensureStateDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ============================================================================
// MIGRATION CONTROLLER
// ============================================================================

class KiotVietMigrator {
  private lemyde: LemydeClient;
  private kiotviet: KiotVietClient;
  private state: MigrationState;
  private branchId: number = 1; // Default branch

  constructor(kiotvietClient: KiotVietClient) {
    this.lemyde = new LemydeClient();
    this.kiotviet = kiotvietClient;
    this.state = loadState();
  }

  private async setBranchId(): Promise<void> {
    try {
      logger.info('Fetching branches from KiotViet...');
      const branches = await this.kiotviet.branches?.list?.({ pageSize: 100 });
      
      if (branches?.data && branches.data.length > 0) {
        logger.info({ branches: branches.data }, 'Available branches');
        
        // Use first branch
        this.branchId = branches.data[0].id;
        logger.info({ branchId: this.branchId }, 'Using branch');
      } else {
        logger.warn('No branches found, using default branchId=1');
      }
    } catch (error) {
      logger.warn({ error }, 'Failed to fetch branches, using default branchId=1');
    }
  }

  private async setErrorState(phase: string, error: Error) {
    this.state.status = 'failed';
    this.state.lastError = {
      phase,
      message: error.message,
      detail: error.stack,
      timestamp: new Date().toISOString(),
    };
    saveState(this.state);
  }

  // =========================================================================
  // PHASE 1: FETCH DATA
  // =========================================================================

  private async fetchOrders(): Promise<LemydeOrder[]> {
    logger.info('Fetching orders from Lemyde (status=1, with nck1 products)...');

    const sql = `
      SELECT 
        o.id AS order_id,
        o.customer_id,
        o.date_created,
        o.note,
        o.total_amount,
        c.id AS customer_id,
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

    const orders = await this.lemyde.query<any>(sql);
    const validated = orders.map((o) => LemydeOrderSchema.parse(o));

    logger.info({ count: validated.length }, 'Fetched orders');
    return validated;
  }

  private async fetchDetailOrders(orderIds: number[]): Promise<LemydeDetailOrder[]> {
    if (orderIds.length === 0) return [];

    logger.info(`Fetching detail orders for ${orderIds.length} orders...`);

    const orderIdList = orderIds.join(',');
    const sql = `
      SELECT 
        do.id AS detail_order_id,
        do.order_id,
        do.product_id,
        p.name AS product_name,
        p.cost_price,
        p.retail_price,
        p.sku,
        p.weight,
        p.introduction,
        do.quantity,
        do.gia_ban,
        do.gia_nhap
      FROM crm.detail_orders do
      JOIN crm.products p ON do.product_id = p.id
      WHERE do.order_id IN (${orderIdList})
      ORDER BY do.order_id, do.id
    `;

    const details = await this.lemyde.query<any>(sql);
    const validated = details.map((d) => LemydeDetailOrderSchema.parse(d));

    logger.info({ count: validated.length }, 'Fetched detail orders');
    return validated;
  }

  private async fetchUniqueCustomers(orderIds: number[]): Promise<LemydeCustomer[]> {
    if (orderIds.length === 0) return [];

    logger.info('Fetching unique customers...');

    const orderIdList = orderIds.join(',');
    const sql = `
      SELECT DISTINCT
        c.id AS customer_id,
        c.name,
        c.phone,
        c.address
      FROM crm.customers c
      WHERE c.id IN (
        SELECT DISTINCT o.customer_id
        FROM crm.orders o
        WHERE o.id IN (${orderIdList})
      )
      ORDER BY c.id
    `;

    const customers = await this.lemyde.query<any>(sql);
    const validated = customers.map((c) => LemydeCustomerSchema.parse(c));

    logger.info({ count: validated.length }, 'Fetched unique customers');
    return validated;
  }

  private async fetchUniqueProducts(orderIds: number[]): Promise<LemydeProduct[]> {
    if (orderIds.length === 0) return [];

    logger.info('Fetching unique products...');

    const orderIdList = orderIds.join(',');
    const sql = `
      SELECT DISTINCT
        p.id AS product_id,
        p.name,
        p.cost_price,
        p.retail_price,
        p.weight,
        p.introduction,
        SUBSTRING(p.name, POSITION('spm' IN p.name), 10) AS spm_code
      FROM crm.products p
      WHERE p.id IN (
        SELECT DISTINCT do.product_id
        FROM crm.detail_orders do
        WHERE do.order_id IN (${orderIdList})
      )
      ORDER BY p.id
    `;

    const products = await this.lemyde.query<any>(sql);
    const validated = products.map((p) => LemydeProductSchema.parse(p));

    logger.info({ count: validated.length }, 'Fetched unique products');
    return validated;
  }

  async phase1Fetch(): Promise<{
    orders: LemydeOrder[];
    detailOrders: LemydeDetailOrder[];
    customers: LemydeCustomer[];
    products: LemydeProduct[];
  }> {
    try {
      logger.info('============ PHASE 1: FETCH DATA ============');
      this.state.phase = 'fetch';
      saveState(this.state);

      const orders = await this.fetchOrders();
      if (orders.length === 0) {
        throw new Error('No orders found with status=1 and nck1 products');
      }

      const orderIds = orders.map((o) => o.order_id);
      const detailOrders = await this.fetchDetailOrders(orderIds);
      const customers = await this.fetchUniqueCustomers(orderIds);
      const products = await this.fetchUniqueProducts(orderIds);

      this.state.statistics.customers.total = customers.length;
      this.state.statistics.products.total = products.length;
      this.state.statistics.orders.total = orders.length;
      saveState(this.state);

      logger.info(
        {
          orders: orders.length,
          details: detailOrders.length,
          customers: customers.length,
          products: products.length,
        },
        'Phase 1 complete'
      );

      return { orders, detailOrders, customers, products };
    } catch (error) {
      await this.setErrorState('fetch', error as Error);
      throw error;
    }
  }

  // =========================================================================
  // PHASE 2: CREATE CUSTOMERS
  // =========================================================================

  async phase2CreateCustomers(customers: LemydeCustomer[]): Promise<void> {
    try {
      logger.info('============ PHASE 2: CREATE CUSTOMERS ============');
      this.state.phase = 'create-customers';
      saveState(this.state);

      for (const customer of customers) {
        // Check if phone exists
        const existing = await this.kiotviet.customers.getByContactNumber(customer.phone);

        if (existing) {
          logger.warn(
            { lemydeId: customer.customer_id, phone: customer.phone },
            'Customer phone already exists in KiotViet - STOPPING'
          );
          throw new Error(`Duplicate phone: ${customer.phone}`);
        }

        // Create customer with branchId
        const createdCustomer = await this.kiotviet.customers.create({
          name: customer.name,
          code: `LY${String(customer.customer_id).padStart(6, '0')}`,
          contactNumber: customer.phone,
          address: customer.address || '',
          branchId: this.branchId,
        });

        this.state.mappings.customers[customer.customer_id] = createdCustomer.id;
        this.state.statistics.customers.created += 1;

        logger.info(
          {
            lemydeId: customer.customer_id,
            kiotvietId: createdCustomer.id,
            phone: customer.phone,
          },
          'Customer created'
        );

        saveState(this.state);
      }

      logger.info(
        { created: this.state.statistics.customers.created },
        'Phase 2 complete'
      );
    } catch (error) {
      await this.setErrorState('create-customers', error as Error);
      throw error;
    }
  }

  // =========================================================================
  // PHASE 3: CREATE PRODUCTS
  // =========================================================================

  private extractSpmId(productName: string): string {
    const match = productName.match(/spm\d+/);
    return match ? match[0] : `P${Date.now()}`;
  }

async phase3CreateProducts(products: LemydeProduct[]): Promise<void> {
    logger.info('Starting product creation');
    try {
      logger.info('============ PHASE 3: CREATE PRODUCTS ============');
      this.state.phase = 'create-products';
      saveState(this.state);

      for (const product of products) {
        const code = `LY${String(product.product_id).padStart(6, '0')}`;
        
        // Check if product already exists in KiotViet
        let existingProduct = null;
        try {
          existingProduct = await this.kiotviet.products.getByCode(code);
        } catch (error) {
          // Product not found, we'll create it
          existingProduct = null;
        }

        if (existingProduct) {
          logger.warn(
            { lemydeId: product.product_id, code, kiotvietId: existingProduct.id },
            'Product already exists in KiotViet - SKIPPING CREATION'
          );
          
          // Update mapping with existing product
          this.state.mappings.products[product.product_id] = existingProduct.id;
          saveState(this.state);
          continue;
        }

        // Create product with default category
        const createdProduct = await this.kiotviet.products.create({
          name: product.name,
          code,
          basePrice: product.cost_price,
          description: product.introduction || '',
          unit: 'Cái',
          categoryId: 1477260, // Default category "Gia dụng"
        });

        this.state.mappings.products[product.product_id] = createdProduct.id;
        this.state.statistics.products.created += 1;

        logger.info(
          {
            lemydeId: product.product_id,
            kiotvietId: createdProduct.id,
            code,
          },
          'Product created'
        );

        saveState(this.state);
      }

      logger.info(
        { created: this.state.statistics.products.created },
        'Phase 3 complete'
      );
    } catch (error) {
      await this.setErrorState('create-products', error as Error);
      throw error;
    }
  }


  // =========================================================================
  // PHASE 4: CREATE ORDERS
  // =========================================================================

  async phase4CreateOrders(
    orders: LemydeOrder[],
    detailOrders: LemydeDetailOrder[]
  ): Promise<void> {
    try {
      logger.info('============ PHASE 4: CREATE ORDERS ============');
      this.state.phase = 'create-orders';
      saveState(this.state);

      for (const order of orders) {
        try {
          // Check if customer exists in mapping
          const kiotvietCustomerId = this.state.mappings.customers[order.customer_id];
          if (!kiotvietCustomerId) {
            logger.warn(
              { lemydeOrderId: order.order_id, customerId: order.customer_id },
              'Customer not found in mapping - SKIPPING ORDER'
            );
            this.state.statistics.orders.failed += 1;
            saveState(this.state);
            continue;
          }

          // Get detail orders for this order
          const orderDetails = detailOrders.filter((d) => d.order_id === order.order_id);

          if (orderDetails.length === 0) {
            logger.warn(
              { lemydeOrderId: order.order_id },
              'No detail orders found - SKIPPING'
            );
            this.state.statistics.orders.failed += 1;
            saveState(this.state);
            continue;
          }

          // Transform detail orders
          const transformedDetails = orderDetails.map((detail) => {
            const kiotvietProductId = this.state.mappings.products[detail.product_id];
            if (!kiotvietProductId) {
              throw new Error(`Product not found in mapping: ${detail.product_id}`);
            }

            return {
              productId: kiotvietProductId,
              productCode: `P${String(detail.product_id).padStart(6, '0')}`,
              productName: detail.product_name,
              quantity: detail.quantity,
              price: detail.gia_ban,
              isMaster: true,
              discount: 0,
              discountRatio: 0,
            };
          });

          // Create order
          const createdOrder = await this.kiotviet.orders.create({
            branchId: this.branchId, // Use detected branch
            customerId: kiotvietCustomerId,
            purchaseDate: order.date_created,
            description: order.note || '',
            orderDetails: transformedDetails,
            discount: 0,
          });

          this.state.statistics.orders.created += 1;

          logger.info(
            {
              lemydeOrderId: order.order_id,
              kiotvietOrderId: createdOrder.id,
              code: createdOrder.code,
              details: transformedDetails.length,
            },
            'Order created'
          );

          saveState(this.state);
        } catch (orderError) {
          const err = orderError as Error;
          logger.error(
            {
              lemydeOrderId: order.order_id,
              error: err.message,
            },
            'Failed to create order - STOPPING MIGRATION'
          );

          await this.setErrorState('create-orders', err);
          throw err;
        }
      }

      logger.info(
        {
          created: this.state.statistics.orders.created,
          failed: this.state.statistics.orders.failed,
        },
        'Phase 4 complete'
      );
    } catch (error) {
      await this.setErrorState('create-orders', error as Error);
      throw error;
    }
  }

  // =========================================================================
  // MAIN MIGRATION
  // =========================================================================

  async run(): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info('================================');
      logger.info('   KiotViet Migration Started');
      logger.info('================================');

      // Get branch ID first
      await this.setBranchId();

      // Phase 1: Fetch
      const { orders, detailOrders, customers, products } = await this.phase1Fetch();

      // Phase 2: Create Customers
     // await this.phase2CreateCustomers(customers);

      // Phase 3: Create Products
      await this.phase3CreateProducts(products);

      // Phase 4: Create Orders
     //817564 await this.phase4CreateOrders(orders, detailOrders);

      // Complete
      this.state.phase = 'complete';
      this.state.status = 'success';
      this.state.endTime = new Date().toISOString();
      saveState(this.state);

      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

      logger.info('================================');
      logger.info('   Migration Completed!');
      logger.info('================================');
      logger.info(this.state.statistics, 'Final statistics');
      logger.info(`Total time: ${duration} minutes`);

      console.log('\n✅ Migration successful!');
      console.log(`State saved to: ${STATE_FILE}`);
    } catch (error) {
         logger.error('--- lỗi gì');
      const err = error as Error;
      logger.error({ error: err.message, stack: err.stack }, 'Migration failed');

      console.error('\n❌ Migration failed!');
      console.error(`Error: ${err.message}`);
      console.error(`State saved to: ${STATE_FILE}`);
      console.error('Run migration again after fixing the error.');

       //setTimeout(() => process.exit(1), 100);
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const kiotvietClient = new KiotVietClient({
    clientId: process.env.KIOTVIET_CLIENT_ID!,
    clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
    retailerName: process.env.KIOTVIET_RETAILER_NAME!,
  });

  const migrator = new KiotVietMigrator(kiotvietClient);
  await migrator.run();
}

main().catch((error) => {
  logger.error({ 
    error: error.message, 
    stack: error.stack,
    name: error.name 
  }, 'Unhandled error');
  //process.exit(1);
});