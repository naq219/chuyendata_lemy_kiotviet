import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

async function searchOrders() {
  const client = new KiotVietClient({
    clientId: process.env.KIOTVIET_CLIENT_ID!,
    clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
    retailerName: process.env.KIOTVIET_RETAILER_NAME!,
  });

  try {
    console.log('🔍 Tìm kiếm đơn hàng trong KiotViet...');
    
    // Tìm kiếm đơn hàng gần đây
    const orders = await client.orders.list({
      pageSize: 20,
      orderBy: 'createdDate',
      orderDirection: 'ASC'
    });

    console.log('✅ Tìm thấy', orders.data?.length || 0, 'đơn hàng');
    console.log('\n📦 Danh sách đơn hàng gần đây:');
    console.log('='.repeat(80));
    
    if (orders.data && orders.data.length > 0) {
      orders.data.forEach((order, index) => {
        console.log(`${index + 1}. ${order.code} - ID: ${order.id} - Ngày: ${order.createdDate}`);
        console.log(`   Khách hàng: ${order.customer?.name || 'N/A'} (ID: ${order.customer?.id || 'N/A'})`);
        console.log(`   Tổng tiền: ${order.totalPayment?.toLocaleString('vi-VN')} VND`);
        console.log(`   Số sản phẩm: ${order.orderDetails?.length || 0}`);
        
        if (order.orderDetails && order.orderDetails.length > 0) {
          console.log(`   Sản phẩm:`);
          order.orderDetails.forEach(detail => {
            console.log(`     - ${detail.product?.name || 'N/A'} (${detail.product?.code || 'N/A'}) - SL: ${detail.quantity} - Giá: ${detail.price?.toLocaleString('vi-VN')} VND`);
          });
        }
        console.log('');
      });
    } else {
      console.log('❌ Không tìm thấy đơn hàng nào');
    }

  } catch (error) {
    console.error('❌ Lỗi khi tìm kiếm đơn hàng:', error);
  }
}

// Tìm kiếm đơn hàng cụ thể theo code
async function searchOrderByCode(orderCode: string) {
  const client = new KiotVietClient({
    clientId: process.env.KIOTVIET_CLIENT_ID!,
    clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
    retailerName: process.env.KIOTVIET_RETAILER_NAME!,
  });

  try {
    console.log(`🔍 Tìm kiếm đơn hàng với code: ${orderCode}`);
    
    const orders = await client.orders.list({
      code: orderCode,
      pageSize: 1
    });

    if (orders.data && orders.data.length > 0) {
      const order = orders.data[0];
      console.log('✅ Tìm thấy đơn hàng:');
      console.log(JSON.stringify(order, null, 2));
      
      // Hiển thị chi tiết sản phẩm
      if (order.orderDetails && order.orderDetails.length > 0) {
        console.log('\n📋 Chi tiết sản phẩm trong đơn:');
        order.orderDetails.forEach(detail => {
          console.log(`   - ${detail.product?.name || 'N/A'} (${detail.product?.code || 'N/A'})`);
          console.log(`     ID: ${detail.productId}, Số lượng: ${detail.quantity}, Giá: ${detail.price}`);
        });
      }
      
      return order;
    } else {
      console.log('❌ Không tìm thấy đơn hàng với code:', orderCode);
      return null;
    }

  } catch (error) {
    console.error('❌ Lỗi khi tìm kiếm đơn hàng:', error);
    return null;
  }
}

// Tìm kiếm đơn hàng theo ID
async function searchOrderById(orderId: number) {
  const client = new KiotVietClient({
    clientId: process.env.KIOTVIET_CLIENT_ID!,
    clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
    retailerName: process.env.KIOTVIET_RETAILER_NAME!,
  });

  try {
    console.log(`🔍 Tìm kiếm đơn hàng với ID: ${orderId}`);
    
    const order = await client.orders.getById(orderId);
    
    if (order) {
      console.log('✅ Tìm thấy đơn hàng:');
      console.log(JSON.stringify(order, null, 2));
      
      // Hiển thị chi tiết sản phẩm
      if (order.orderDetails && order.orderDetails.length > 0) {
        console.log('\n📋 Chi tiết sản phẩm trong đơn:');
        order.orderDetails.forEach(detail => {
          console.log(`   - ${detail.product?.name || 'N/A'} (${detail.product?.code || 'N/A'})`);
          console.log(`     ID: ${detail.productId}, Số lượng: ${detail.quantity}, Giá: ${detail.price}`);
        });
      }
      
      return order;
    } else {
      console.log('❌ Không tìm thấy đơn hàng với ID:', orderId);
      return null;
    }

  } catch (error) {
    console.error('❌ Lỗi khi tìm kiếm đơn hàng:', error);
    return null;
  }
}

// Chạy theo tham số dòng lệnh
const args = process.argv.slice(2);

if (args.length > 0) {
  const command = args[0];
  
  if (command === 'code' && args[1]) {
    searchOrderByCode(args[1]);
  } else if (command === 'id' && args[1]) {
    searchOrderById(parseInt(args[1]));
  } else if (command === 'all') {
    searchOrders();
  } else {
    console.log('Usage:');
    console.log('  npm run search:orders code DH000018');
    console.log('  npm run search:orders id 3226365');
    console.log('  npm run search:orders all');
  }
} else {
  // Mặc định tìm tất cả đơn hàng
  searchOrders();
}