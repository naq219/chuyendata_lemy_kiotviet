import fs from 'fs';
import path from 'path';

interface MigrationMapping {
  customers: Record<string, number>;
  products: Record<string, number>;
  orders: Record<string, { kiotvietId: number; kiotvietCode: string }>;
}

function validateProductMapping() {
  try {
    const mappingPath = path.join(__dirname, 'UI', 'data', 'migration_mapping.json');
    const mappingContent = fs.readFileSync(mappingPath, 'utf-8');
    const mapping: MigrationMapping = JSON.parse(mappingContent);
    
    const { products } = mapping;
    
    console.log('🔍 Bắt đầu validate product mapping...');
    console.log(`📊 Tổng số products: ${Object.keys(products).length}`);
    
    // Kiểm tra duplicate KiotViet IDs
    const kiotVietIdMap = new Map<number, string[]>();
    const errors: string[] = [];
    
    for (const [lemydeId, kiotVietId] of Object.entries(products)) {
      // Kiểm tra Lemyde ID hợp lệ
      if (!lemydeId || lemydeId.trim() === '') {
        errors.push(`❌ Lemyde ID rỗng cho KiotViet ID: ${kiotVietId}`);
        continue;
      }
      
      // Kiểm tra KiotViet ID hợp lệ
      if (!kiotVietId || kiotVietId <= 0) {
        errors.push(`❌ KiotViet ID không hợp lệ: ${kiotVietId} cho Lemyde ID: ${lemydeId}`);
        continue;
      }
      
      // Track duplicate KiotViet IDs
      if (kiotVietIdMap.has(kiotVietId)) {
        kiotVietIdMap.get(kiotVietId)!.push(lemydeId);
      } else {
        kiotVietIdMap.set(kiotVietId, [lemydeId]);
      }
    }
    
    // Kiểm tra duplicate KiotViet IDs
    const duplicates: [number, string[]][] = [];
    for (const [kiotVietId, lemydeIds] of kiotVietIdMap.entries()) {
      if (lemydeIds.length > 1) {
        duplicates.push([kiotVietId, lemydeIds]);
        errors.push(`❌ DUPLICATE: KiotViet ID ${kiotVietId} được map tới nhiều Lemyde IDs: ${lemydeIds.join(', ')}`);
      }
    }
    
    // Kiểm tra Lemyde IDs có giá trị hợp lệ
    const invalidLemydeIds = Object.keys(products).filter(id => {
      const numId = parseInt(id);
      return isNaN(numId) || numId <= 0;
    });
    
    if (invalidLemydeIds.length > 0) {
      errors.push(`❌ Lemyde IDs không hợp lệ: ${invalidLemydeIds.join(', ')}`);
    }
    
    // Summary
    console.log('\n📋 KẾT QUẢ VALIDATE:');
    console.log(`✅ Tổng số mapping: ${Object.keys(products).length}`);
    console.log(`❌ Tổng số lỗi: ${errors.length}`);
    console.log(`⚠️  Số duplicate KiotViet IDs: ${duplicates.length}`);
    console.log(`⚠️  Số Lemyde IDs không hợp lệ: ${invalidLemydeIds.length}`);
    
    // Hiển thị chi tiết lỗi
    if (errors.length > 0) {
      console.log('\n🔴 CHI TIẾT LỖI:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      // Hiển thị duplicate details
      if (duplicates.length > 0) {
        console.log('\n🔍 CHI TIẾT DUPLICATE:');
        duplicates.forEach(([kiotVietId, lemydeIds]) => {
          console.log(`KiotViet ID ${kiotVietId} -> Lemyde IDs: ${lemydeIds.join(', ')}`);
        });
      }
    } else {
      console.log('✅ KHÔNG CÓ LỖI! Product mapping hợp lệ.');
    }
    
    return errors.length === 0;
    
  } catch (error) {
    console.error('❌ Lỗi khi validate product mapping:', error);
    return false;
  }
}

// Chạy validate
if (require.main === module) {
  validateProductMapping();
}

export { validateProductMapping };