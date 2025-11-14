import * as fs from 'fs';
import * as path from 'path';

// Interface cho Lemyde product
type LemydeProduct = {
  product_id: number;
  name: string;
  cost_price: number;
  introduction?: string;
};

// Interface cho state migration
interface MigrationState {
  mappings: {
    products: Record<number, number>; // Lemyde ID -> KiotViet ID
  };
  statistics: {
    products: {
      created: number;
      skipped?: number;
    };
  };
}

/**
 * Đọc file state.json từ migration
 */
function loadState(): MigrationState | null {
  try {
    const statePath = path.join(__dirname, 'migration', 'state.json');
    if (!fs.existsSync(statePath)) {
      console.log('❌ File state.json không tồn tại');
      return null;
    }
    
    const stateContent = fs.readFileSync(statePath, 'utf-8');
    return JSON.parse(stateContent);
    
  } catch (error) {
    console.error('❌ Lỗi khi đọc state.json:', (error as Error).message);
    return null;
  }
}

/**
 * Đọc file products từ Lemyde (giả định)
 */
function loadLemydeProducts(): LemydeProduct[] {
  // Giả định đây là danh sách products từ Lemyde
  // Trong thực tế, bạn cần đọc từ file CSV/JSON của Lemyde
  return [
    // Ví dụ một số products
    { product_id: 10160, name: 'ẤM ĐUN NƯỚC GẤP GỌN GIRMI 600ML', cost_price: 700000 },
    { product_id: 9778, name: 'BẤM MÓNG TAY EBELIN MÀU ĐEN NCK1', cost_price: 85000 },
    // ... thêm các products khác từ dữ liệu thực
  ];
}

/**
 * Phân tích và hiển thị các products bị bỏ qua
 */
function analyzeSkippedProducts(state: MigrationState, lemydeProducts: LemydeProduct[]) {
  console.log('🔍 PHÂN TÍCH PRODUCTS BỊ BỎ QUA\n');
  
  const skippedProducts: LemydeProduct[] = [];
  const mappedProducts: { lemydeId: number, kiotvietId: number, product: LemydeProduct }[] = [];
  
  // Phân tích từng product
  lemydeProducts.forEach(product => {
    const kiotvietId = state.mappings.products[product.product_id];
    
    if (kiotvietId) {
      mappedProducts.push({ 
        lemydeId: product.product_id, 
        kiotvietId, 
        product 
      });
    } else {
      skippedProducts.push(product);
    }
  });
  
  // Hiển thị kết quả
  console.log(`📊 TỔNG SỐ PRODUCTS TỪ LEMYDE: ${lemydeProducts.length}`);
  console.log(`✅ ĐÃ MAP: ${mappedProducts.length} products`);
  console.log(`❌ BỊ BỎ QUA: ${skippedProducts.length} products\n`);
  
  // Hiển thị chi tiết products bị bỏ qua
  if (skippedProducts.length > 0) {
    console.log('📋 DANH SÁCH PRODUCTS BỊ BỎ QUA:');
    console.log('='.repeat(80));
    
    skippedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product.product_id} - ${product.name}`);
      console.log(`   💰 Giá: ${product.cost_price.toLocaleString('vi-VN')}đ`);
      console.log('   '.repeat(40));
    });
  }
  
  // Hiển thị statistics từ state
  console.log('\n📈 THỐNG KÊ TỪ STATE.JSON:');
  console.log(`   ➕ Products đã tạo: ${state.statistics.products.created}`);
  console.log(`   ⏭️  Products bỏ qua: ${skippedProducts.length}`);
  
  return { skippedProducts, mappedProducts };
}

/**
 * Kiểm tra file log để xem warnings về products bị skip
 */
function checkLogForSkippedWarnings() {
  const logPath = path.join(__dirname, 'migration', 'logs.jsonl');
  
  if (!fs.existsSync(logPath)) {
    console.log('📝 File logs.jsonl không tồn tại');
    return;
  }
  
  try {
    const logContent = fs.readFileSync(logPath, 'utf-8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    const skipWarnings = lines.filter(line => 
      line.includes('SKIPPING CREATION') || 
      line.includes('Product already exists')
    );
    
    console.log(`\n📋 FOUND ${skipWarnings.length} SKIP WARNINGS IN LOGS:`);
    
    skipWarnings.forEach((warning, index) => {
      try {
        const logEntry = JSON.parse(warning);
        console.log(`${index + 1}. ${logEntry.msg} - Product: ${logEntry.code}`);
      } catch {
        console.log(`${index + 1}. ${warning.substring(0, 100)}...`);
      }
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi đọc log file:', (error as Error).message);
  }
}

// Main function
async function main() {
  console.log('🔄 KIỂM TRA PRODUCTS BỊ BỎ QUA TRONG MIGRATION\n');
  
  // 1. Đọc state.json
  const state = loadState();
  if (!state) {
    console.log('❌ Không thể tiếp tục without state.json');
    return;
  }
  
  // 2. Đọc danh sách products từ Lemyde (cần cập nhật theo file thực tế)
  const lemydeProducts = loadLemydeProducts();
  
  if (lemydeProducts.length === 0) {
    console.log('❌ Không có dữ liệu products từ Lemyde');
    console.log('💡 Hãy cập nhật hàm loadLemydeProducts() với dữ liệu thực tế');
    return;
  }
  
  // 3. Phân tích products bị bỏ qua
  const analysis = analyzeSkippedProducts(state, lemydeProducts);
  
  // 4. Kiểm tra log warnings
  checkLogForSkippedWarnings();
  
  console.log('\n✅ HOÀN THÀNH KIỂM TRA');
}

// Chạy chương trình
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Lỗi trong quá trình kiểm tra:', error.message);
    process.exit(1);
  });
}

export { analyzeSkippedProducts, loadState };