import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Khởi tạo KiotViet client
const client = new KiotVietClient({
  clientId: process.env.KIOTVIET_CLIENT_ID!,
  clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
  retailerName: process.env.KIOTVIET_RETAILER_NAME!
});

// Hàm trích xuất ID Lemyde từ mã code
function extractLemydeIdFromCode(code: string | null | undefined, prefix: string): number | null {
  if (!code || typeof code !== 'string') return null;
  
  // Loại bỏ prefix và các số 0 phía trước
  const cleanedCode = code.replace(new RegExp(`^${prefix}`), '').replace(/^0+/, '');
  
  // Nếu sau khi loại bỏ prefix và số 0 mà chuỗi rỗng, trả về 0
  if (cleanedCode === '') return 0;
  
  const id = parseInt(cleanedCode, 10);
  return isNaN(id) ? null : id;
}

// Hàm lấy tất cả products từ KiotViet
async function getAllProducts() {
  try {
    let allProducts: any[] = [];
    let currentPage = 1;
    const pageSize = 100;
    
    while (true) {
      console.log(`Đang lấy trang ${currentPage} products...`);
      
      const response = await client.products.list({
        pageSize,
        currentItem: (currentPage - 1) * pageSize,
      });
      
      if (!response.data || response.data.length === 0) {
        break;
      }
      
      allProducts = [...allProducts, ...response.data];
      
      if (response.data.length < pageSize) {
        break;
      }
      
      currentPage++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return allProducts;
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách products:', error);
    throw error;
  }
}

// Hàm lấy tất cả customers từ KiotViet
async function getAllCustomers() {
  try {
    let allCustomers: any[] = [];
    let currentPage = 1;
    const pageSize = 100;
    
    while (true) {
      console.log(`Đang lấy trang ${currentPage} customers...`);
      
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
    console.error('Lỗi khi lấy danh sách customers:', error);
    throw error;
  }
}

// Hàm cập nhật mapping JSON
async function updateMigrationMapping() {
  try {
    console.log('🔄 Bắt đầu cập nhật migration mapping...\n');
    
    // Đọc file mapping hiện tại
    const mappingFilePath = path.join(__dirname, 'UI', 'data', 'all_migration_mapping.json');
    let currentMapping: any = { customers: {}, products: {} };
    
    if (fs.existsSync(mappingFilePath)) {
      const fileContent = fs.readFileSync(mappingFilePath, 'utf-8');
      currentMapping = JSON.parse(fileContent);
    }
    
    console.log('📦 Đang lấy danh sách products từ KiotViet...');
    const products = await getAllProducts();
    console.log(`✅ Đã lấy được ${products.length} products`);
    
    console.log('👥 Đang lấy danh sách customers từ KiotViet...');
    const customers = await getAllCustomers();
    console.log(`✅ Đã lấy được ${customers.length} customers`);
    
    // Cập nhật mapping products
    const productMappings: { [key: string]: number } = { ...currentMapping.products };
    let newProductMappings = 0;
    
    for (const product of products) {
      if (product.code && product.id) {
        const lemydeId = extractLemydeIdFromCode(product.code, 'MY');
        if (lemydeId && !productMappings[lemydeId]) {
          productMappings[lemydeId] = product.id;
          newProductMappings++;
          console.log(`➕ Product mapping: ${lemydeId} -> ${product.id} (${product.code})`);
        }
      }
    }
    
    // Cập nhật mapping customers
    const customerMappings: { [key: string]: number } = { ...currentMapping.customers };
    let newCustomerMappings = 0;
    
    for (const customer of customers) {
      if (customer.code && customer.id) {
        const lemydeId = extractLemydeIdFromCode(customer.code, 'LY');
        if (lemydeId && !customerMappings[lemydeId]) {
          customerMappings[lemydeId] = customer.id;
          newCustomerMappings++;
          console.log(`➕ Customer mapping: ${lemydeId} -> ${customer.id} (${customer.code})`);
        }
      }
    }
    
    // Tạo object mapping mới
    const newMapping = {
      customers: customerMappings,
      products: productMappings
    };
    
    // Ghi file
    fs.writeFileSync(mappingFilePath, JSON.stringify(newMapping, null, 2));
    
    console.log(`\n✅ Hoàn thành!`);
    console.log(`📊 Tổng products mapping: ${Object.keys(productMappings).length}`);
    console.log(`📊 Tổng customers mapping: ${Object.keys(customerMappings).length}`);
    console.log(`🆕 Products mapping mới: ${newProductMappings}`);
    console.log(`🆕 Customers mapping mới: ${newCustomerMappings}`);
    console.log(`💾 File đã lưu: ${mappingFilePath}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật migration mapping:', error);
    process.exit(1);
  }
}

// Chạy script
if (require.main === module) {
  updateMigrationMapping();
}

export { extractLemydeIdFromCode, updateMigrationMapping };