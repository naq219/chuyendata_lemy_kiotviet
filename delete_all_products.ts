import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';
import pino from 'pino';

// Load environment variables
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
 * Xóa toàn bộ products từ KiotViet
 * Lưu ý: Thao tác này không thể hoàn tác, hãy chắc chắn trước khi chạy
 */
async function deleteAllProducts() {
  try {
    logger.info('🔄 Bắt đầu xóa toàn bộ products...');

    // Lấy danh sách tất cả products
    let currentItem = 0;
    const pageSize = 100;
    let totalProducts = 0;
    let deletedCount = 0;

    do {
      logger.info(`📋 Đang lấy products từ ${currentItem} đến ${currentItem + pageSize}...`);
      
      const response = await client.products.list({
        pageSize,
        currentItem,
      });

      totalProducts = response.total;
      const products = response.data;

      if (products.length === 0) {
        logger.info('✅ Không còn products nào để xóa');
        break;
      }

      logger.info(`📦 Tìm thấy ${products.length} products, bắt đầu xóa...`);

      // Xóa từng product
      for (const product of products) {
        try {
          logger.info(`🗑️  Đang xóa product: ${product.code} - ${product.name} (ID: ${product.id})`);
          await client.products.delete(product.id);
          deletedCount++;
          logger.info(`✅ Đã xóa product: ${product.code}`);
          
          // Thêm delay nhỏ để tránh rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          logger.error(`❌ Lỗi khi xóa product ${product.code}: ${error.message}`);
          
          // Nếu là lỗi "Product is being used", bỏ qua và tiếp tục
          if (error.message.includes('being used') || error.message.includes('đang được sử dụng')) {
            logger.warn(`⚠️  Product ${product.code} đang được sử dụng, bỏ qua`);
            continue;
          }
          
          // Nếu là lỗi khác, có thể dừng lại hoặc tiếp tục tùy ý
          // throw error; // Bỏ comment nếu muốn dừng khi gặp lỗi
        }
      }

      currentItem += pageSize;

    } while (currentItem < totalProducts);

    logger.info(`🎉 Hoàn thành! Đã xóa ${deletedCount} products`);

  } catch (error: any) {
    logger.error(`💥 Lỗi trong quá trình xóa products: ${error.message}`);
    if (error.response?.data) {
      logger.error(`📋 Chi tiết lỗi: ${JSON.stringify(error.response.data)}`);
    }
    process.exit(1);
  }
}

/**
 * Hàm chính với xác nhận an toàn
 */
async function main() {
  console.log('🚨 CẢNH BÁO: Thao tác này sẽ xóa TOÀN BỘ products từ KiotViet');
  console.log('🚨 Dữ liệu đã xóa KHÔNG THỂ khôi phục');
  console.log('');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Hỏi xác nhận
  const answer = await new Promise<string>(resolve => {
    readline.question('❓ Bạn có chắc chắn muốn tiếp tục? (nhập "DELETE" để xác nhận): ', resolve);
  });

  readline.close();

  if (answer.trim().toUpperCase() !== 'DELETE') {
    console.log('❌ Đã hủy thao tác');
    process.exit(0);
  }

  console.log('');
  console.log('⏳ Đang bắt đầu xóa products...');
  console.log('');

  await deleteAllProducts();
}

// Chạy script
if (require.main === module) {
  main().catch(error => {
    logger.error(`💥 Lỗi không xác định: ${error.message}`);
    process.exit(1);
  });
}