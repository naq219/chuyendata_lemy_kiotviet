// ============================================================================
// check_customer_mismatch.ts - Kiểm tra thông tin khách hàng không trùng khớp
// ============================================================================
// File này kiểm tra thông tin khách hàng giữa KiotViet và Lemyde API
// Mục đích: Phát hiện sự không trùng khớp trong thông tin khách hàng (tên, số điện thoại, địa chỉ)
// ============================================================================

import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Khởi tạo KiotViet client
const client = new KiotVietClient({
  clientId: process.env.KIOTVIET_CLIENT_ID!,
  clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
  retailerName: process.env.KIOTVIET_RETAILER_NAME!
});

// LEMYDE API configuration
const LEMYDE_API_URL = process.env.LEMYDE_API_URL || 'http://connect.lemyde.com';

// Hàm query Lemyde API
async function lemydeQuery<T>(sql: string): Promise<T[]> {
  console.log(  `Lemyde query: ${LEMYDE_API_URL+'/get?sql='+sql}`);
  const response = await axios.get(LEMYDE_API_URL + '/get', {
    params: { sql },
  });

  if (response.data.status !== 1 || !response.data.data) {
    throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
  }

  return response.data.data as T[];
}

// Hàm trích xuất ID Lemyde từ mã code
function extractLemydeIdFromCode(code: string | null | undefined, prefix: string): number | null {
  if (!code || typeof code !== 'string') return null;
  
  const cleanedCode = code.replace(new RegExp(`^${prefix}`), '').replace(/^0+/, '');
  if (cleanedCode === '') return 0;
  
  const id = parseInt(cleanedCode, 10);
  return isNaN(id) ? null : id;
}

// Hàm lấy tất cả customers từ KiotViet
async function getAllKiotVietCustomers() {
  try {
    let allCustomers: any[] = [];
    let currentPage = 1;
    const pageSize = 100;
    
    while (true) {
      console.log(`Đang lấy trang ${currentPage} customers từ KiotViet...`);
      
      const response = await client.customers.list({
        pageSize,
        currentItem: (currentPage - 1) * pageSize,
      });
      
      if (!response.data || response.data.length === 0) {
        break;
      }
      
      allCustomers = [...allCustomers, ...response.data];
      
      if (response.data.length < pageSize) {
        break;
      }
      
      currentPage++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return allCustomers;
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách customers từ KiotViet:', error);
    throw error;
  }
}

// Hàm tìm customer trong Lemyde bằng ID
async function findLemydeCustomerById(customerId: number) {
  try {
    const sql = `
      SELECT id, name, phone, address, nick_facebook
      FROM crm.customers 
      WHERE id = ${customerId}
    `;
    
    const customers = await lemydeQuery<any>(sql);
    return customers.length > 0 ? customers[0] : null;
    
  } catch (error) {
    console.error(`Lỗi khi tìm customer ${customerId} trong Lemyde:`, error);
    return null;
  }
}

// Hàm tìm customer trong Lemyde bằng số điện thoại
async function findLemydeCustomerByPhone(phone: string) {
  try {
    const sql = `
      SELECT id, name, phone, address, nick_facebook
      FROM crm.customers 
      WHERE phone = '${phone.replace(/'/g, "''")}'
    `;
    
    const customers = await lemydeQuery<any>(sql);
    return customers;
    
  } catch (error) {
    console.error(`Lỗi khi tìm customer với phone ${phone} trong Lemyde:`, error);
    return [];
  }
}

// Hàm kiểm tra thông tin không trùng khớp
function checkCustomerMismatch(kiotvietCustomer: any, lemydeCustomer: any): string[] {
  const mismatches: string[] = [];

  if (kiotvietCustomer.name && lemydeCustomer.name && 
      kiotvietCustomer.name.trim() !== lemydeCustomer.name.trim()) {
    mismatches.push(`Tên: "${kiotvietCustomer.name}" vs "${lemydeCustomer.name}"`);
  }

  if (kiotvietCustomer.contactNumber && lemydeCustomer.phone && 
      kiotvietCustomer.contactNumber.trim() !== lemydeCustomer.phone.trim()) {
    mismatches.push(`SĐT: "${kiotvietCustomer.contactNumber}" vs "${lemydeCustomer.phone}"`);
  }

  if (kiotvietCustomer.address && lemydeCustomer.address && 
      kiotvietCustomer.address.trim() !== lemydeCustomer.address.trim()) {
    mismatches.push(`Địa chỉ: "${kiotvietCustomer.address}" vs "${lemydeCustomer.address}"`);
  }

  return mismatches;
}

// Hàm chính để kiểm tra không trùng khớp
async function checkCustomerMismatches() {
  try {
    console.log('🔄 Bắt đầu kiểm tra thông tin khách hàng không trùng khớp...\n');
    
    // Lấy tất cả customers từ KiotViet
    console.log('📦 Đang lấy danh sách customers từ KiotViet...');
    const kiotvietCustomers = await getAllKiotVietCustomers();
    console.log(`✅ Đã lấy được ${kiotvietCustomers.length} customers từ KiotViet`);
    
    const results: any[] = [];
    let checkedCount = 0;
    let mismatchCount = 0;
    
    // Kiểm tra từng customer
    for (const kvCustomer of kiotvietCustomers) {
      checkedCount++;
      
      // Trích xuất ID Lemyde từ code
      const lemydeId = extractLemydeIdFromCode(kvCustomer.code, 'LY');
      
      if (lemydeId !== null) {
        console.log(`🔍 Kiểm tra customer ${checkedCount}/${kiotvietCustomers.length}: ID ${lemydeId} (${kvCustomer.code})`);
        
        // Tìm customer trong Lemyde bằng ID
        const lemydeCustomer = await findLemydeCustomerById(lemydeId);
        
        if (lemydeCustomer) {
          // Kiểm tra không trùng khớp
          const mismatches = checkCustomerMismatch(kvCustomer, lemydeCustomer);
          
          if (mismatches.length > 0) {
            mismatchCount++;
            results.push({
              kiotvietId: kvCustomer.id,
              kiotvietCode: kvCustomer.code,
              lemydeId: lemydeId,
              mismatches: mismatches,
              kiotvietData: {
                name: kvCustomer.name,
                phone: kvCustomer.contactNumber,
                address: kvCustomer.address
              },
              lemydeData: {
                name: lemydeCustomer.name,
                phone: lemydeCustomer.phone,
                address: lemydeCustomer.address
              }
            });
            
            console.log(`❌ Không trùng khớp: ${kvCustomer.code} - ${mismatches.join(', ')}`);
          }
        } else {
          // Nếu không tìm thấy bằng ID, thử tìm bằng số điện thoại
          if (kvCustomer.contactNumber) {
            const lemydeCustomersByPhone = await findLemydeCustomerByPhone(kvCustomer.contactNumber);
            
            if (lemydeCustomersByPhone.length > 0) {
              console.log(`⚠️  Customer ${kvCustomer.code} không tìm thấy bằng ID nhưng có SĐT trùng: ${lemydeCustomersByPhone.length} kết quả`);
            }
          }
        }
      }
      
      // Nghỉ giữa các request để tránh rate limiting
      if (checkedCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Ghi kết quả ra file
    const outputFile = path.join(__dirname, 'customer_mismatch_report.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalChecked: checkedCount,
      totalMismatches: mismatchCount,
      results: results
    }, null, 2));
    
    console.log(`\n✅ Hoàn thành kiểm tra!`);
    console.log(`📊 Tổng số customers đã kiểm tra: ${checkedCount}`);
    console.log(`❌ Số lượng không trùng khớp: ${mismatchCount}`);
    console.log(`💾 Báo cáo đã lưu: ${outputFile}`);
    
    // Hiển thị summary
    if (mismatchCount > 0) {
      console.log(`\n📋 Summary không trùng khớp:`);
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.kiotvietCode}: ${result.mismatches.join(' | ')}`);
      });
    } else {
      console.log(`🎉 Tất cả thông tin khách hàng đều trùng khớp!`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra không trùng khớp:', error);
    process.exit(1);
  }
}

// Chạy script
if (require.main === module) {
  checkCustomerMismatches();
}

export { checkCustomerMismatches };