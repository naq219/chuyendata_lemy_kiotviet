import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';
import pino from 'pino';
import * as fs from 'fs';
import * as path from 'path';

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

// Load Lemyde customers data (giả định có file customers.json)
interface LemydeCustomer {
  customer_id: number;
  name: string;
  phone: string;
  address?: string;
}

/**
 * Load Lemyde customers từ file JSON
 */
function loadLemydeCustomers(): LemydeCustomer[] {
  try {
    // Thay đổi đường dẫn này theo file thực tế của bạn
    const customersPath = path.join(__dirname, 'data', 'customers.json');
    
    if (fs.existsSync(customersPath)) {
      const data = fs.readFileSync(customersPath, 'utf8');
      return JSON.parse(data);
    }
    
    // Nếu không có file, trả về mảng rỗng
    logger.warn('Không tìm thấy file customers.json, sử dụng dữ liệu từ state');
    return [];
    
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Lỗi khi load Lemyde customers');
    return [];
  }
}

/**
 * Lấy danh sách tất cả customers từ KiotViet
 */
async function getAllKiotVietCustomers() {
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
 * Tìm mapping dựa trên phone number
 */
function findMappingsByPhone(
  lemydeCustomers: LemydeCustomer[], 
  kiotvietCustomers: any[]
): Record<number, number> {
  const mappings: Record<number, number> = {};
  let foundCount = 0;
  
  logger.info('Bắt đầu tìm mapping bằng phone number...');
  
  // Tạo map phone -> KiotViet customer
  const kiotvietPhoneMap: Record<string, any> = {};
  kiotvietCustomers.forEach(customer => {
    if (customer.contactNumber) {
      kiotvietPhoneMap[customer.contactNumber] = customer;
    }
  });
  
  // So khớp bằng phone number
  lemydeCustomers.forEach(lemydeCustomer => {
    const kiotvietCustomer = kiotvietPhoneMap[lemydeCustomer.phone];
    
    if (kiotvietCustomer) {
      mappings[lemydeCustomer.customer_id] = kiotvietCustomer.id;
      foundCount++;
      
      logger.info({
        lemydeId: lemydeCustomer.customer_id,
        kiotvietId: kiotvietCustomer.id,
        phone: lemydeCustomer.phone,
        name: lemydeCustomer.name
      }, '✅ Tìm thấy mapping');
    } else {
      logger.warn({
        lemydeId: lemydeCustomer.customer_id,
        phone: lemydeCustomer.phone,
        name: lemydeCustomer.name
      }, '❌ Không tìm thấy customer trong KiotViet');
    }
  });
  
  logger.info({ found: foundCount, total: lemydeCustomers.length }, 'Kết quả tìm mapping');
  return mappings;
}

/**
 * Tìm mapping dựa trên customer code (LY000001 format)
 */
function findMappingsByCode(
  lemydeCustomers: LemydeCustomer[], 
  kiotvietCustomers: any[]
): Record<number, number> {
  const mappings: Record<number, number> = {};
  let foundCount = 0;
  
  logger.info('Bắt đầu tìm mapping bằng customer code...');
  
  // Tạo map code -> KiotViet customer
  const kiotvietCodeMap: Record<string, any> = {};
  kiotvietCustomers.forEach(customer => {
    if (customer.code) {
      kiotvietCodeMap[customer.code] = customer;
    }
  });
  
  // So khớp bằng code (LY000001 format)
  lemydeCustomers.forEach(lemydeCustomer => {
    const expectedCode = `LY${String(lemydeCustomer.customer_id).padStart(6, '0')}`;
    const kiotvietCustomer = kiotvietCodeMap[expectedCode];
    
    if (kiotvietCustomer) {
      mappings[lemydeCustomer.customer_id] = kiotvietCustomer.id;
      foundCount++;
      
      logger.info({
        lemydeId: lemydeCustomer.customer_id,
        kiotvietId: kiotvietCustomer.id,
        code: expectedCode,
        name: lemydeCustomer.name
      }, '✅ Tìm thấy mapping bằng code');
    } else {
      logger.warn({
        lemydeId: lemydeCustomer.customer_id,
        expectedCode,
        name: lemydeCustomer.name
      }, '❌ Không tìm thấy customer bằng code');
    }
  });
  
  logger.info({ found: foundCount, total: lemydeCustomers.length }, 'Kết quả tìm mapping bằng code');
  return mappings;
}

/**
 * Cập nhật state.json với mappings mới
 */
function updateStateWithMappings(mappings: Record<number, number>) {
  try {
    const statePath = path.join(__dirname, 'migration', 'state.json');
    
    if (!fs.existsSync(statePath)) {
      logger.error('Không tìm thấy file state.json');
      return false;
    }
    
    const stateData = fs.readFileSync(statePath, 'utf8');
    const state = JSON.parse(stateData);
    
    // Cập nhật mappings
    state.mappings.customers = mappings;
    
    // Cập nhật statistics
    state.statistics.customers.created = Object.keys(mappings).length;
    
    // Lưu file
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    
    logger.info({ 
      mappingsCount: Object.keys(mappings).length 
    }, '✅ Đã cập nhật state.json với mappings mới');
    
    return true;
    
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Lỗi khi cập nhật state.json');
    return false;
  }
}

/**
 * Main function để recover mappings
 */
async function recoverCustomerMappings() {
  try {
    console.log('🔍 BẮT ĐẦU KHÔI PHỤC CUSTOMER MAPPINGS\n');
    
    // 1. Load Lemyde customers
    const lemydeCustomers = loadLemydeCustomers();
    
    if (lemydeCustomers.length === 0) {
      console.log('❌ Không có dữ liệu Lemyde customers để so sánh');
      console.log('💡 Hãy đảm bảo file customers.json tồn tại trong thư mục data/');
      return;
    }
    
    console.log(`📊 Loaded ${lemydeCustomers.length} Lemyde customers`);
    
    // 2. Get all KiotViet customers
    const kiotvietCustomers = await getAllKiotVietCustomers();
    
    if (kiotvietCustomers.length === 0) {
      console.log('❌ Không có customers trong KiotViet');
      return;
    }
    
    console.log(`📊 Found ${kiotvietCustomers.length} KiotViet customers`);
    
    // 3. Tìm mappings bằng phone number (ưu tiên cao nhất)
    console.log('\n📞 Tìm mapping bằng phone number...');
    const phoneMappings = findMappingsByPhone(lemydeCustomers, kiotvietCustomers);
    
    // 4. Tìm mappings bằng code (dự phòng)
    console.log('\n🏷️  Tìm mapping bằng customer code...');
    const codeMappings = findMappingsByCode(lemydeCustomers, kiotvietCustomers);
    
    // 5. Kết hợp mappings (ưu tiên phone mapping trước)
    const finalMappings = { ...codeMappings, ...phoneMappings };
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 KẾT QUẢ KHÔI PHỤC MAPPING:');
    console.log(`✅ Tổng mappings tìm được: ${Object.keys(finalMappings).length}`);
    console.log(`📞 Bằng phone: ${Object.keys(phoneMappings).length}`);
    console.log(`🏷️  Bằng code: ${Object.keys(codeMappings).length}`);
    console.log(`📋 Tổng Lemyde customers: ${lemydeCustomers.length}`);
    console.log('='.repeat(60));
    
    if (Object.keys(finalMappings).length > 0) {
      // 6. Cập nhật state.json
      console.log('\n💾 Đang cập nhật state.json...');
      const success = updateStateWithMappings(finalMappings);
      
      if (success) {
        console.log('🎉 KHÔI PHỤC THÀNH CÔNG!');
        console.log('💡 Bây giờ bạn có thể chạy lại migration để tạo orders');
      } else {
        console.log('❌ Không thể cập nhật state.json');
      }
    } else {
      console.log('\n⚠️  Không tìm thấy mapping nào');
      console.log('💡 Có thể customers chưa được tạo trong KiotViet');
    }
    
  } catch (error) {
    console.error('\n💥 LỖI HỆ THỐNG:', (error as Error).message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  recoverCustomerMappings();
}