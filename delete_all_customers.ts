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
 * Lấy danh sách tất cả customers từ KiotViet
 */
async function getAllCustomers() {
  try {
    logger.info('Đang lấy danh sách tất cả customers từ KiotViet...');
    
    let allCustomers: any[] = [];
    let currentPage = 1;
    const pageSize = 100;
    
    while (true) {
      logger.info(`Đang lấy trang ${currentPage}...`);
      
      const response = await client.customers.list({
        pageSize,
        currentItem: (currentPage - 1) * pageSize,
      });
      
      if (!response.data || response.data.length === 0) {
        logger.info('Đã lấy hết tất cả customers');
        break;
      }
      
      allCustomers = [...allCustomers, ...response.data];
      logger.info(`Đã lấy được ${response.data.length} customers, tổng: ${allCustomers.length}`);
      
      // Nếu số lượng trả về ít hơn pageSize, có nghĩa là đã hết
      if (response.data.length < pageSize) {
        break;
      }
      
      currentPage++;
      
      // Tạm dừng 1 giây để tránh rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return allCustomers;
    
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Lỗi khi lấy danh sách customers');
    throw error;
  }
}

/**
 * Xóa một customer bằng API trực tiếp (vì SDK không hỗ trợ delete)
 */
async function deleteCustomer(customer: any) {
  try {
    logger.info({ customerId: customer.id, code: customer.code }, 'Đang xóa customer...');
    
    // Sử dụng API trực tiếp vì SDK không có phương thức delete
    const response = await client.apiClient.delete(`/customers/${customer.id}`);
    
    logger.info({ 
      customerId: customer.id, 
      code: customer.code,
      name: customer.name 
    }, '✅ Đã xóa customer thành công');
    
    return true;
    
  } catch (error) {
    logger.error({ 
      customerId: customer.id, 
      code: customer.code,
      error: (error as Error).message 
    }, '❌ Lỗi khi xóa customer');
    
    // Ném lỗi để có thể xử lý tiếp
    throw error;
  }
}

/**
 * Xóa tất cả customers
 */
async function deleteAllCustomers() {
  try {
    console.log('🚀 BẮT ĐẦU XÓA TOÀN BỘ CUSTOMERS TRONG KIOTVIET\n');
    console.log('⚠️  CẢNH BÁO: HÀNH ĐỘNG NÀY SẼ XÓA VĨNH VIỄN TẤT CẢ CUSTOMERS!\n');
    
    // Xác nhận từ người dùng
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>(resolve => {
      readline.question('Bạn có chắc chắn muốn xóa TOÀN BỘ customers? (yes/no): ', resolve);
    });
    
    readline.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Hủy thao tác xóa customers');
      return;
    }
    
    console.log('✅ Đã xác nhận, bắt đầu xóa...\n');
    
    // Lấy danh sách tất cả customers
    const allCustomers = await getAllCustomers();
    
    if (allCustomers.length === 0) {
      console.log('🎉 Không có customer nào để xóa!');
      return;
    }
    
    console.log(`📋 Tổng số customers sẽ bị xóa: ${allCustomers.length}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];
    
    // Xử lý từng customer
    for (let i = 0; i < allCustomers.length; i++) {
      const customer = allCustomers[i];
      
      console.log(`\n${i + 1}/${allCustomers.length}: ${customer.code} - ${customer.name}`);
      
      try {
        await deleteCustomer(customer);
        successCount++;
        
        // Tạm dừng 2 giây giữa các request để tránh rate limiting
        if (i < allCustomers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
      } catch (error) {
        errorCount++;
        errors.push({
          customerId: customer.id,
          code: customer.code,
          name: customer.name,
          error: (error as Error).message
        });
        
        // Vẫn tiếp tục với customer tiếp theo
        console.log(`⏭️  Bỏ qua customer này, tiếp tục với customer tiếp theo...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Hiển thị kết quả tổng
    console.log('\n' + '='.repeat(60));
    console.log('📊 KẾT QUẢ XÓA CUSTOMERS:');
    console.log(`✅ Xóa thành công: ${successCount} customers`);
    console.log(`❌ Xóa thất bại: ${errorCount} customers`);
    console.log('='.repeat(60));
    
    if (errors.length > 0) {
      console.log('\n📝 Chi tiết lỗi:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.code} - ${error.name}: ${error.error}`);
      });
    }
    
    if (successCount > 0) {
      console.log(`\n🎉 Đã xóa thành công ${successCount} customers!`);
      console.log('💡 Bây giờ bạn có thể chạy lại migration để import customers mới.');
    }
    
  } catch (error) {
    console.error('\n💥 LỖI HỆ THỐNG:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Kiểm tra nhanh số lượng customers hiện có
 */
async function checkCustomerCount() {
  try {
    console.log('🔍 KIỂM TRA SỐ LƯỢNG CUSTOMERS HIỆN CÓ\n');
    
    const customers = await getAllCustomers();
    
    console.log(`📊 Tổng số customers trong hệ thống: ${customers.length}`);
    
    if (customers.length > 0) {
      console.log('\n📋 10 customers đầu tiên:');
      customers.slice(0, 10).forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.code} - ${customer.name} (ID: ${customer.id})`);
      });
      
      if (customers.length > 10) {
        console.log(`... và ${customers.length - 10} customers khác`);
      }
    }
    
    return customers.length;
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra customers:', (error as Error).message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('👥 CÔNG CỤ QUẢN LÝ CUSTOMERS KIOTVIET\n');
    
    const args = process.argv.slice(2);
    
    if (args.includes('--check')) {
      // Kiểm tra số lượng customers
      await checkCustomerCount();
      
    } else if (args.includes('--delete-all')) {
      // Xóa toàn bộ customers
      await deleteAllCustomers();
      
    } else {
      // Hướng dẫn sử dụng
      console.log('📖 CÁCH SỬ DỤNG:');
      console.log('   --check               Kiểm tra số lượng customers hiện có');
      console.log('   --delete-all          Xóa toàn bộ customers (⚠️  nguy hiểm)');
      console.log('');
      console.log('📝 Ví dụ:');
      console.log('   npx tsx delete_all_customers.ts --check');
      console.log('   npx tsx delete_all_customers.ts --delete-all');
      console.log('');
      console.log('⚠️  CẢNH BÁO: Lệnh --delete-all sẽ xóa VĨNH VIỄN tất cả customers!');
      console.log('   Hãy chắc chắn bạn đã backup dữ liệu trước khi thực hiện.');
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