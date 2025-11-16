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
 * Lấy danh sách tất cả products đang không cho phép bán (allowsSale: false)
 */
async function getProductsWithSaleDisabled() {
  try {
    logger.info('Đang tìm products có allowsSale: false...');
    
    let allProducts: any[] = [];
    let currentPage = 1;
    const pageSize = 100;
    
    while (true) {
      logger.info(`Đang lấy trang ${currentPage}...`);
      
      const response = await client.products.list({
        pageSize,
        currentItem: (currentPage - 1) * pageSize,
      });
      
      if (!response.data || response.data.length === 0) {
        break;
      }
      
      // Lọc các products có allowsSale: false
      const disabledProducts = response.data.filter((product: any) => product.allowsSale === false);
      allProducts = [...allProducts, ...disabledProducts];
      
      logger.info(`Trang ${currentPage}: ${response.data.length} products, ${disabledProducts.length} products không cho bán`);
      
      if (response.data.length < pageSize) {
        break;
      }
      
      currentPage++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    logger.info(`Tong cong ${allProducts.length} products dang khong cho phep ban`);
    return allProducts;
    
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Lỗi khi lấy danh sách products');
    throw error;
  }
}

/**
 * Bật allowsSale: true cho một product
 */
async function enableProductSale(product: any) {
  try {
    logger.info({ productId: product.id, code: product.code }, 'Đang bật allowsSale cho product...');
    
    // Tạo payload update chỉ thay đổi allowsSale
    const updatePayload = {
      ...product,
      allowsSale: true,
      // Giữ nguyên các field khác
      id: product.id,
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      basePrice: product.basePrice,
      unit: product.unit
    };
    
    // Gọi API update product
    const updatedProduct = await client.products.update(product.id, updatePayload);
    
    logger.info({ 
      productId: product.id, 
      code: product.code, 
      success: true 
    }, '✅ Đã bật allowsSale thành công');
    
    return updatedProduct;
    
  } catch (error) {
    logger.error({ 
      productId: product.id, 
      code: product.code, 
      error: (error as Error).message 
    }, '❌ Lỗi khi bật allowsSale');
    
    // Ném lỗi để có thể xử lý tiếp
    throw error;
  }
}

/**
 * Bật allowsSale cho tất cả products đang disabled
 */
async function enableAllProductsSale() {
  try {
    console.log('🚀 BẮT ĐẦU BẬT ALLOWSSALE CHO TẤT CẢ PRODUCTS\n');
    
    // Lấy danh sách products đang disabled
    const disabledProducts = await getProductsWithSaleDisabled();
    
    if (disabledProducts.length === 0) {
      console.log('🎉 Không có product nào đang không cho phép bán!');
      return;
    }
    
    console.log(`📋 Tổng số products cần bật allowsSale: ${disabledProducts.length}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];
    
    // Xử lý từng product
    for (let i = 0; i < disabledProducts.length; i++) {
      const product = disabledProducts[i];
      
      console.log(`\n${i + 1}/${disabledProducts.length}: ${product.code} - ${product.name}`);
      
      try {
        await enableProductSale(product);
        successCount++;
        
        // Tạm dừng 1 giây giữa các request để tránh rate limiting
        if (i < disabledProducts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        errorCount++;
        errors.push({
          productId: product.id,
          code: product.code,
          error: (error as Error).message
        });
        
        // Vẫn tiếp tục với product tiếp theo
        console.log(`⏭️  Bỏ qua product này, tiếp tục với product tiếp theo...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Hiển thị kết quả tổng
    console.log('\n' + '='.repeat(50));
    console.log('📊 KẾT QUẢ:');
    console.log(`✅ Thành công: ${successCount} products`);
    console.log(`❌ Thất bại: ${errorCount} products`);
    console.log('='.repeat(50));
    
    if (errors.length > 0) {
      console.log('\n📝 Chi tiết lỗi:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.code}: ${error.error}`);
      });
    }
    
    if (successCount > 0) {
      console.log('\n🎉 Đã bật allowsSale thành công cho phần lớn products!');
    }
    
  } catch (error) {
    console.error('\n💥 LỖI HỆ THỐNG:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Kiểm tra nhanh trạng thái allowsSale của một product cụ thể
 */
async function checkProductSaleStatus(productCode: string) {
  try {
    console.log(`🔍 Kiểm tra trạng thái allowsSale của product: ${productCode}`);
    
    const product = await client.products.getByCode(productCode);
    
    console.log('📋 Thông tin product:');
    console.log(`   Code: ${product.code}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   allowsSale: ${product.allowsSale ? '✅ TRUE' : '❌ FALSE'}`);
    console.log(`   isActive: ${product.isActive ? '✅ TRUE' : '❌ FALSE'}`);
    
    return product;
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra product:', (error as Error).message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🛒 CÔNG CỤ BẬT ALLOWSSALE CHO PRODUCTS KIOTVIET\n');
    
    const args = process.argv.slice(2);
    
    if (args.includes('--check')) {
      // Kiểm tra trạng thái của một product cụ thể
      const productCode = args[args.indexOf('--check') + 1];
      if (!productCode) {
        console.log('Vui lòng cung cấp mã product (ví dụ: --check LY010160)');
        return;
      }
      
      await checkProductSaleStatus(productCode);
      
    } else if (args.includes('--enable-all')) {
      // Bật allowsSale cho tất cả products đang disabled
      await enableAllProductsSale();
      
    } else {
      // Hướng dẫn sử dụng
      console.log('📖 CÁCH SỬ DỤNG:');
      console.log('   --check LY010160          Kiểm tra trạng thái allowsSale của một product');
      console.log('   --enable-all              Bật allowsSale: true cho tất cả products đang disabled');
      console.log('');
      console.log('📝 Ví dụ:');
      console.log('   npx tsx enable_products_sale.ts --check LY010160');
      console.log('   npx tsx enable_products_sale.ts --enable-all');
    }
    
  } catch (error) {
    console.error('\n❌ Có lỗi xảy ra:', (error as Error).message);
    process.exit(1);
  }
}

// Chạy chương trình
if (require.main === module) {
  main();
}