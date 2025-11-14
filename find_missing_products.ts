import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

interface MigrationState {
  mappings: {
    products: Record<number, number>;
    customers: Record<number, number>;
  };
  data: {
    products: Array<{
      product_id: number;
      product_name: string;
      product_code: string;
    }>;
    orders: Array<{
      order_id: number;
      customer_id: number;
      order_date: string;
      total_amount: number;
    }>;
    orderDetails: Array<{
      order_id: number;
      product_id: number;
      product_name: string;
      quantity: number;
      gia_ban: number;
    }>;
  };
  statistics: {
    products: {
      total: number;
      created: number;
      failed: number;
    };
  };
}

interface MissingProduct {
  product_id: number;
  product_name: string;
  product_code: string;
  affected_orders: number[];
  total_quantity: number;
  total_value: number;
}

async function findMissingProducts(): Promise<MissingProduct[]> {
  try {
    // Read state.json for mappings
    const statePath = join(__dirname, 'migration', 'state.json');
    const stateData = readFileSync(statePath, 'utf-8');
    const state = JSON.parse(stateData);

    if (!state.mappings?.products) {
      console.error('❌ No product mappings found in state.json');
      return [];
    }

    const productMappings = state.mappings.products;
    
    // Connect to Lemyde database
    const connection = await mysql.createConnection({
      host: process.env.LEMYDE_DB_HOST,
      port: parseInt(process.env.LEMYDE_DB_PORT || '3306'),
      user: process.env.LEMYDE_DB_USER,
      password: process.env.LEMYDE_DB_PASSWORD,
      database: process.env.LEMYDE_DB_NAME,
    });

    console.log('🔗 Connected to Lemyde database');

    // Fetch all products from Lemyde database
    const [products] = await connection.execute(`
      SELECT DISTINCT
        p.id AS product_id,
        p.name,
        p.cost_price,
        p.retail_price,
        p.weight,
        p.introduction,
        SUBSTRING(p.name, POSITION('spm' IN p.name), 10) AS spm_code
      FROM crm.products p
      ORDER BY p.id
    `);

    // Fetch all order details from Lemyde database
    const [orderDetailsResult] = await connection.execute(`
      SELECT 
        do.order_id,
        do.product_id,
        p.name AS product_name,
        do.quantity,
        do.gia_ban
      FROM crm.detail_orders do
      JOIN crm.products p ON do.product_id = p.id
      ORDER BY do.order_id, do.product_id
    `);

    await connection.end();

    const allProducts = new Map<number, {name: string, code: string}>();
    const orderDetails: Array<{order_id: number, product_id: number, product_name: string, quantity: number, gia_ban: number}> = [];

    // Process products
    for (const product of products as any[]) {
      allProducts.set(product.product_id, {
        name: product.name,
        code: `P${String(product.product_id).padStart(6, '0')}`
      });
    }

    // Process order details
    for (const detail of orderDetailsResult as any[]) {
      orderDetails.push({
        order_id: detail.order_id,
        product_id: detail.product_id,
        product_name: detail.product_name,
        quantity: detail.quantity,
        gia_ban: detail.gia_ban
      });
    }
    
    console.log('📊 Total products in data:', allProducts.size);
    console.log('📊 Product mappings found:', Object.keys(productMappings).length);
    
    // Find missing products (not in mappings)
    const missingProducts: MissingProduct[] = [];

    for (const [productId, productInfo] of allProducts) {
      if (!productMappings[productId]) {
        // Find orders that contain this product
        const affectedOrders = orderDetails
          .filter(detail => detail.product_id === productId)
          .map(detail => detail.order_id);

        // Calculate total quantity and value
        const orderDetailsForProduct = orderDetails
          .filter(detail => detail.product_id === productId);
        
        const totalQuantity = orderDetailsForProduct.reduce((sum, detail) => sum + detail.quantity, 0);
        const totalValue = orderDetailsForProduct.reduce((sum, detail) => sum + (detail.quantity * detail.gia_ban), 0);

        missingProducts.push({
          product_id: productId,
          product_name: productInfo.name,
          product_code: productInfo.code,
          affected_orders: [...new Set(affectedOrders)], // Remove duplicates
          total_quantity: totalQuantity,
          total_value: totalValue
        });
      }
    }

    // Sort by total value (most valuable first)
    missingProducts.sort((a, b) => b.total_value - a.total_value);

    return missingProducts;

  } catch (error) {
    console.error('Error finding missing products:', error);
    return [];
  }
}

async function main() {
  console.log('🔍 Finding missing products (no mapping to KiotViet)...');
  
  const missingProducts = await findMissingProducts();
  
  if (missingProducts.length === 0) {
    console.log('✅ No missing products found! All products have mappings.');
    return;
  }

  console.log(`\n📊 Found ${missingProducts.length} missing products:`);
  console.log('='.repeat(80));
  
  let totalMissingValue = 0;
  let totalMissingQuantity = 0;
  
  missingProducts.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.product_name} (ID: ${product.product_id})`);
    console.log(`   📦 Code: ${product.product_code}`);
    console.log(`   🛒 Quantity: ${product.total_quantity} units`);
    console.log(`   💰 Value: ${product.total_value.toLocaleString('vi-VN')} VND`);
    console.log(`   📋 Affected orders: ${product.affected_orders.length} orders`);
    if (product.affected_orders.length > 0) {
      console.log(`      Orders: ${product.affected_orders.slice(0, 5).join(', ')}${product.affected_orders.length > 5 ? '...' : ''}`);
    }
    
    totalMissingValue += product.total_value;
    totalMissingQuantity += product.total_quantity;
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📈 SUMMARY:`);
  console.log(`   Total missing products: ${missingProducts.length}`);
  console.log(`   Total missing quantity: ${totalMissingQuantity} units`);
  console.log(`   Total missing value: ${totalMissingValue.toLocaleString('vi-VN')} VND`);
  console.log(`   Average value per product: ${Math.round(totalMissingValue / missingProducts.length).toLocaleString('vi-VN')} VND`);

  // Save to JSON file
  const outputPath = join(__dirname, 'data', 'missing_products.json');
  writeFileSync(outputPath, JSON.stringify(missingProducts, null, 2), 'utf-8');
  
  console.log(`\n💾 Missing products list saved to: data/missing_products.json`);
  console.log('\n⚠️  These products need to be manually created in KiotViet or excluded from migration.');
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { findMissingProducts };