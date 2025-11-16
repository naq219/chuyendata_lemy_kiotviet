import { KiotVietClient } from './kiotviet-client-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize KiotViet client
const client = new KiotVietClient({
  clientId: process.env.KIOTVIET_CLIENT_ID!,
  clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
  retailerName: process.env.KIOTVIET_RETAILER_NAME!,
});

/**
 * Lấy danh sách tất cả kênh bán hàng từ KiotViet API
 * Sử dụng API trực tiếp vì SDK không có resource riêng cho sales channels
 */
async function getAllSaleChannels() {
  try {
    console.log('📋 Đang lấy danh sách kênh bán hàng từ KiotViet...');
    
    // Sử dụng API trực tiếp để lấy danh sách kênh bán hàng
    const response = await client.apiClient.get('/salechannels');
    
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('⚠️ Không tìm thấy dữ liệu kênh bán hàng');
    return [];
    
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách kênh bán hàng:', (error as any).response?.data || error);
    throw error;
  }
}

/**
 * Hiển thị danh sách kênh bán hàng dạng bảng
 */
function displaySaleChannels(channels: any[]) {
  console.log('\n📊 DANH SÁCH KÊNH BÁN HÀNG KIOTVIET');
  console.log('='.repeat(80));
  
  if (channels.length === 0) {
    console.log('📭 Không có kênh bán hàng nào');
    return;
  }
  
  console.log(`Tổng số: ${channels.length} kênh bán hàng\n`);
  
  // Hiển thị dạng bảng
  console.log('ID'.padEnd(10) + ' | ' + 'MÃ'.padEnd(15) + ' | ' + 'TÊN KÊNH'.padEnd(30) + ' | ' + 'TRẠNG THÁI');
  console.log('-'.repeat(80));
  
  channels.forEach((channel) => {
    const id = channel.id?.toString() || 'N/A';
    const code = channel.code || 'N/A';
    const name = channel.name || 'N/A';
    const status = channel.isActive ? '✅ Hoạt động' : '❌ Ngừng';
    
    console.log(
      id.padEnd(10) + ' | ' +
      code.padEnd(15) + ' | ' +
      name.padEnd(30) + ' | ' +
      status
    );
  });
  
  console.log('\n💡 Sử dụng ID kênh bán hàng khi tạo đơn hàng (saleChannelId)');
}

/**
 * Lưu danh sách kênh bán hàng ra file JSON
 */
function saveSaleChannelsToFile(channels: any[]) {
  const fs = require('fs');
  const path = require('path');
  
  const outputDir = './data';
  const outputFile = path.join(outputDir, 'sale_channels.json');
  
  // Đảm bảo thư mục tồn tại
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Lưu ra file
  fs.writeFileSync(outputFile, JSON.stringify(channels, null, 2), 'utf8');
  console.log(`\n💾 Đã lưu danh sách kênh bán hàng vào: ${outputFile}`);
}

/**
 * Hàm chính
 */
async function main() {
  try {
    console.log('🚀 BẮT ĐẦU LẤY DANH SÁCH KÊNH BÁN HÀNG\n');
    
    // Kiểm tra biến môi trường
    const requiredEnvVars = ['KIOTVIET_CLIENT_ID', 'KIOTVIET_CLIENT_SECRET', 'KIOTVIET_RETAILER_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Thiếu biến môi trường:', missingVars.join(', '));
      console.log('💡 Vui lòng kiểm tra file .env');
      process.exit(1);
    }
    
    // Lấy danh sách kênh bán hàng
    const saleChannels = await getAllSaleChannels();
    
    // Hiển thị kết quả
    displaySaleChannels(saleChannels);
    
    // Lưu ra file
    saveSaleChannelsToFile(saleChannels);
    
    console.log('\n🎉 HOÀN TẤT!');
    
  } catch (error) {
    console.error('\n💥 LỖI:', (error as Error).message);
    
    // Gợi ý khắc phục
    console.log('\n🔧 GỢI Ý KHẮC PHỤC:');
    console.log('1. Kiểm tra kết nối internet');
    console.log('2. Kiểm tra thông tin đăng nhập KiotViet trong file .env');
    console.log('3. Kiểm tra quyền truy cập API');
    
    process.exit(1);
  }
}

// Chạy chương trình
if (require.main === module) {
  main();
}

export { getAllSaleChannels, displaySaleChannels };