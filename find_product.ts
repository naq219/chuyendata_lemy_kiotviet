import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

// Logger setup
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

const client = new KiotVietClient({
  clientId: process.env.KIOTVIET_CLIENT_ID!,
  clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
  retailerName: process.env.KIOTVIET_RETAILER_NAME!,
});

/**
 * Tìm product bằng mã code
 */
async function findProductByCode(code: string) {
  try {
    logger.info({ code }, 'Bat dau tim product theo ma code');
    
    const product = await client.products.getByCode(code);
    
    if (product) {
      logger.info(
        { 
          code, 
          productId: product.id, 
          productName: product.name,
          price: product.price,
          status: product.status
        }, 
        'Da tim thay product'
      );
      
      console.log('\n✅ Product found:');
      console.log(`ID: ${product.id}`);
      console.log(`Code: ${product.code}`);
      console.log(`Name: ${product.name}`);
      console.log(`Price: ${product.price?.toLocaleString('vi-VN')} VND`);
      console.log(`Status: ${product.status}`);
      console.log(`Category: ${product.categoryName}`);
      
      return product;
    } else {
      logger.warn({ code }, 'Khong tim thay product');
      console.log('\n❌ Product not found');
      return null;
    }
    
  } catch (error) {
    logger.error(
      { code, error: (error as Error).message }, 
      'Loi khi tim product'
    );
    console.log('\n❌ Error finding product:', (error as Error).message);
    return null;
  }
}

/**
 * Lấy tất cả sản phẩm (có phân trang)
 */
async function getAllProducts(page: number = 1, pageSize: number = 100) {
  try {
    logger.info({ page, pageSize }, 'Bat dau lay danh sach tat ca san pham');
    
    const response = await client.products.list({ 
      pageSize,
      currentItem: (page - 1) * pageSize
    });
    
    if (response.data && response.data.length > 0) {
      logger.info(
        { page, pageSize, count: response.data.length }, 
        'Da lay duoc danh sach san pham'
      );
      
      console.log(`\n✅ Found ${response.data.length} products (Page ${page}):`);
      response.data.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Code: ${product.code}`);
        console.log(`   Price: ${product.price?.toLocaleString('vi-VN')} VND`);
        console.log(`   Status: ${product.status}`);
      });
      
      // Hiển thị thông tin phân trang
      if (response.paging) {
        console.log(`\n📄 Page Info: ${response.paging.currentItem}-${response.paging.currentItem + response.data.length} of ${response.paging.total}`);
      }
      
      return response;
    } else {
      logger.warn({ page, pageSize }, 'Khong co san pham nao');
      console.log('\n❌ No products found');
      return null;
    }
    
  } catch (error) {
    logger.error(
      { page, pageSize, error: (error as Error).message }, 
      'Loi khi lay danh sach san pham'
    );
    console.log('\n❌ Error getting products:', (error as Error).message);
    return null;
  }
}

/**
 * Tìm product bằng tên (tìm kiếm gần đúng)
 */
async function findProductByName(name: string) {
  try {
    logger.info({ name }, 'Bat dau tim product theo ten');
    
    const response = await client.products.list({ 
      productName: name,
      pageSize: 10
    });
    
    if (response.data && response.data.length > 0) {
      logger.info(
        { name, count: response.data.length }, 
        'Da tim thay products'
      );
      
      console.log(`\n✅ Found ${response.data.length} products:`);
      response.data.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Code: ${product.code}`);
        console.log(`   Price: ${product.price?.toLocaleString('vi-VN')} VND`);
        console.log(`   Status: ${product.status}`);
      });
      
      return response.data;
    } else {
      logger.warn({ name }, 'Khong tim thay product theo ten');
      console.log('\n❌ No products found with that name');
      return [];
    }
    
  } catch (error) {
    logger.error(
      { name, error: (error as Error).message }, 
      'Loi khi tim product theo ten'
    );
    console.log('\n❌ Error searching products:', (error as Error).message);
    return [];
  }
}

/**
 * Hiển thị chi tiết product
 */
function displayProductDetails(product: any) {
  console.log('\n📦 Product Details:');
  console.log('====================');
  console.log(`ID: ${product.id}`);
  console.log(`Code: ${product.code}`);
  console.log(`Name: ${product.name}`);
  console.log(`Description: ${product.description || 'N/A'}`);
  console.log(`Price: ${product.price?.toLocaleString('vi-VN')} VND`);
  console.log(`Cost Price: ${product.costPrice?.toLocaleString('vi-VN')} VND`);
  console.log(`Status: ${product.status}`);
  console.log(`Category: ${product.categoryName || 'N/A'}`);
  console.log(`Unit: ${product.unit || 'N/A'}`);
  console.log(`Weight: ${product.weight || 'N/A'} kg`);
  console.log(`Inventory: ${product.inventory || 0}`);
  console.log(`Allow Sale: ${product.allowSale ? 'Yes' : 'No'}`);
  console.log(`Created: ${product.createdDate}`);
  console.log(`Modified: ${product.modifiedDate}`);
}

// Main function
async function main() {
  let args = process.argv.slice(2);
  
  // Khi chạy qua npm run, arguments sẽ có dạng: ['find-product', '--', 'all']
  // Cần lọc bỏ '--' và các phần không cần thiết
  if (args.includes('--')) {
    const dashIndex = args.indexOf('--');
    args = args.slice(dashIndex + 1);
  } else {
    // Nếu không có '--', có thể đang chạy trực tiếp với tsx
    // Giữ nguyên arguments
    args = args.filter(arg => arg !== 'find-product');
  }
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npm run find-product -- code <product-code>');
    console.log('  npm run find-product -- name <product-name>');
    console.log('  npm run find-product -- all [page] [pageSize]');
    return;
  }
  
  const command = args[0];
  
  // Chỉ yêu cầu value cho các command cần tìm kiếm
  if (command !== 'all' && args.length < 2) {
    console.log('Please provide a search value');
    return;
  }
  
  const value = args[1];
  
  try {
    if (command === 'code') {
      const product = await findProductByCode(value);
      if (product) {
        displayProductDetails(product);
      }
    } else if (command === 'name') {
      await findProductByName(value);
    } else if (command === 'all') {
      const page = args[1] ? parseInt(args[1]) : 1;
      const pageSize = args[2] ? parseInt(args[2]) : 100;
      await getAllProducts(page, pageSize);
    } else {
      console.log('Invalid command. Use "code", "name", or "all"');
    }
    
  } catch (error) {
    console.error('Unexpected error:', (error as Error).message);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { findProductByCode, findProductByName, displayProductDetails };