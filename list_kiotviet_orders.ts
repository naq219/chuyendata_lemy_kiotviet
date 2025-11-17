import { KiotVietClient } from 'kiotviet-client-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// KIOTVIET CLIENT
// ============================================================================

class KiotVietOrderLister {
  private client: KiotVietClient;

  constructor() {
    this.client = new KiotVietClient({
    clientId: process.env.KIOTVIET_CLIENT_ID!,
    clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
    retailerName: process.env.KIOTVIET_RETAILER_NAME!,
  });
  }

  async listAllOrders() {
    try {
      console.log('📋 Lấy danh sách orders từ KiotViet...');
      
      let allOrders: any[] = [];
      let currentPage = 1;
      const pageSize = 1;
      let hasMore = true;

      while (hasMore) {
        hasMore=false
        console.log(`📄 Đang lấy trang ${currentPage}...`);
        
        const response = await this.client.orders.list({
          page: currentPage,
          pageSize: pageSize,
          orderBy: 'createdDate',
          orderDirection: 'desc',
        });

        if (response.data && response.data.length > 0) {
          allOrders = allOrders.concat(response.data);
          console.log(`✅ Đã lấy ${response.data.length} orders từ trang ${currentPage}`);
          
          if (response.data.length < pageSize) {
            hasMore = false;
          } else {
            currentPage++;
            // Delay để tránh rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } else {
          hasMore = false;
        }
      }

      return allOrders;
    } catch (error) {
      console.error('❌ Lỗi khi lấy orders từ KiotViet:', error);
      throw error;
    }
  }

  async listOrdersWithDetails() {
    try {
      const orders = await this.listAllOrders();

      // Hiển thị danh sách orders
      console.log('\n📋 DANH SÁCH ORDERS TỪ KIOTVIET:');
      console.log('='.repeat(120));
      
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order #${order.code || order.id}`);
        console.log(`   🆔 ID: ${order.id}`);
        console.log(`   📅 Ngày tạo: ${order.createdDate}`);
        console.log(`   👤 Khách hàng: ${order.customerName || 'N/A'} (${order.customerCode || 'N/A'})`);
        console.log(`   📞 SĐT: ${order.contactNumber || 'N/A'}`);
        console.log(`   💰 Tổng tiền: ${order.total?.toLocaleString('vi-VN') || '0'} VNĐ`);
        console.log(`   🏷️  Trạng thái: ${order.status || 'N/A'}`);
        console.log(`   📍 Chi nhánh: ${order.branchName || 'N/A'}`);
        
        if (order.orderDetails && order.orderDetails.length > 0) {
          console.log(`   🛒 Sản phẩm: ${order.orderDetails.length} sản phẩm`);
          order.orderDetails.forEach((detail: any, i: number) => {
            if (i < 3) { // Chỉ hiển thị 3 sản phẩm đầu
              console.log(`      ${i + 1}. ${detail.productName} x${detail.quantity} - ${detail.price?.toLocaleString('vi-VN')} VNĐ`);
            }
          });
          if (order.orderDetails.length > 3) {
            console.log(`      ... và ${order.orderDetails.length - 3} sản phẩm khác`);
          }
        }
      });

      console.log('\n' + '='.repeat(120));
      console.log(`📊 Tổng số orders: ${orders.length}`);

      // Thống kê
      const totalAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const statusCounts = orders.reduce((acc, order) => {
        const status = order.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(`💰 Tổng giá trị orders: ${totalAmount.toLocaleString('vi-VN')} VNĐ`);
      console.log('\n📈 Thống kê trạng thái:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} orders`);
      });

      // Lưu vào file JSON
      const outputPath = path.join(__dirname, 'data', 'kiotviet_orders.json');
      fs.writeFileSync(outputPath, JSON.stringify(orders, null, 2));
      console.log(`\n💾 Đã lưu danh sách orders vào: ${outputPath}`);

      return orders;

    } catch (error) {
      console.error('❌ Lỗi:', error.message);
      throw error;
    }
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  try {
    const lister = new KiotVietOrderLister();
    await lister.listOrdersWithDetails();
  } catch (error) {
    console.error('❌ Lỗi thực thi:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// EXECUTE
// ============================================================================

if (require.main === module) {
  main();
}

export { KiotVietOrderLister };