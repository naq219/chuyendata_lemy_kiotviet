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
 * Lấy danh sách tất cả products từ KiotViet
 */
async function getAllProducts() {
  try {
    logger.info('Bat dau lay danh sach products tu KiotViet...');
    
    let allProducts: any[] = [];
    let currentPage = 1;
    const pageSize = 100; // Lấy tối đa 100 sản phẩm mỗi trang
    
    while (true) {
      logger.info(`Dang lay trang ${currentPage}...`);
      
      const response = await client.products.list({
        pageSize,
        currentItem: (currentPage - 1) * pageSize,
      });
      
      if (!response.data || response.data.length === 0) {
        logger.info('Da lay het tat ca products');
        break;
      }
      
      allProducts = [...allProducts, ...response.data];
      logger.info(`Da lay duoc ${response.data.length} products, tong: ${allProducts.length}`);
      
      // Nếu số lượng trả về ít hơn pageSize, có nghĩa là đã hết
      if (response.data.length < pageSize) {
        break;
      }
      
      currentPage++;
      
      // Tạm dừng 1 giây để tránh rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return allProducts;
    
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Lỗi khi lấy danh sách products');
    throw error;
  }
}

/**
 * Lấy danh sách products theo mã code
 */
async function getProductsByCode(codes: string[]) {
  try {
    logger.info({ codes }, 'Bat dau lay products theo ma code...');
    
    const products = [];
    
    for (const code of codes) {
      try {
        const product = await client.products.getByCode(code);
        products.push(product);
        logger.info({ code, productId: product.id }, 'Da tim thay product');
      } catch (error) {
        logger.warn({ code, error: (error as Error).message }, 'Không tìm thấy product');
      }
      
      // Tạm dừng 0.5 giây giữa các request
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return products;
    
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Lỗi khi lấy products theo code');
    throw error;
  }
}

/**
 * Lọc và hiển thị thông tin products
 */
function displayProducts(products: any[]) {
  console.log('\n=== DANH SÁCH PRODUCTS ===');
  console.log(`Tổng số: ${products.length} products\n`);
  
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.code} - ${product.name}`);
    console.log(`   ID: ${product.id}, Giá: ${product.basePrice}đ`);
    console.log(`   Category: ${product.categoryId}, Đơn vị: ${product.unit}`);
    console.log(`   Mô tả: ${product.description?.substring(0, 50)}...`);
    console.log('---');
  });
}

/**
 * Export danh sách products ra file JSON
 */
function exportProductsToFile(products: any[], filename: string = 'products_export.json') {
  const fs = require('fs');
  const path = require('path');
  
  const exportDir = './exports';
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  const filePath = path.join(exportDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
  
  logger.info({ filePath }, 'Đã export danh sách products ra file');
  return filePath;
}

// Main execution
async function main() {
  try {
    console.log('🛒 CÔNG CỤ LẤY DANH SÁCH PRODUCTS TỪ KIOTVIET\n');
    
    // Lựa chọn chức năng
    const args = process.argv.slice(2);
    
    if (args.includes('--codes')) {
      // Lấy products theo danh sách codes cụ thể
      const codes = args.slice(args.indexOf('--codes') + 1);
      if (codes.length === 0) {
        console.log('Vui lòng cung cấp danh sách mã code (ví dụ: --codes LY000001 LY000002)');
        return;
      }
      
      const products = await getProductsByCode(codes);
      displayProducts(products);
      
    } else {
      // Lấy tất cả products
      const products = await getAllProducts();
      displayProducts(products);
      
      // Export ra file
      const exportFile = exportProductsToFile(products);
      console.log(`\n📁 File export: ${exportFile}`);
    }
    
    console.log('\n✅ Hoàn thành!');
    
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Lỗi trong quá trình lấy products');
    console.error('\n❌ Có lỗi xảy ra:', (error as Error).message);
    process.exit(1);
  }
}

// Chạy chương trình
if (require.main === module) {
  main();
}

export { getAllProducts, getProductsByCode, exportProductsToFile };