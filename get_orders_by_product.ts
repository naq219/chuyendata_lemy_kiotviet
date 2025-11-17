import { KiotVietClient } from 'kiotviet-client-sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface OrderWithProductTotal {
    orderId: number;
    orderCode: string;
    purchaseDate: string;
    customerName: string;
    totalAmount: number;
    productCount: number;
}

async function getOrdersByProductIds(productIds: number[]): Promise<{
    orders: OrderWithProductTotal[];
    totalRevenue: number;
    orderCount: number;
}> {
    const client = new KiotVietClient({
        clientId: process.env.KIOTVIET_CLIENT_ID!,
        clientSecret: process.env.KIOTVIET_CLIENT_SECRET!,
        retailerName: process.env.KIOTVIET_RETAILER_NAME!,
    });

    try {
        console.log(`🔍 Tìm kiếm orders có product IDs: ${productIds.join(', ')}`);
        
        // Lấy tất cả orders (có thể cần pagination nếu nhiều orders)
        const allOrders = await client.orders.list({
            pageSize: 1000, // Lấy nhiều orders nhất có thể
            includeOrderDelivery: false,
            includePayment: false
        });

        if (!allOrders.data || allOrders.data.length === 0) {
            console.log('❌ Không tìm thấy orders nào');
            return { orders: [], totalRevenue: 0, orderCount: 0 };
        }

        // Lọc orders có chứa product IDs được chỉ định
        const filteredOrders: OrderWithProductTotal[] = [];
        let totalRevenue = 0;

        for (const order of allOrders.data) {
            // Kiểm tra nếu order có orderDetails và chứa product IDs cần tìm
            if (order.orderDetails && order.orderDetails.length > 0) {
                const hasTargetProducts = order.orderDetails.some(detail => 
                    productIds.includes(detail.productId)
                );

                if (hasTargetProducts) {
                    // Đếm số lượng product target trong order này
                    const targetProductCount = order.orderDetails.filter(detail => 
                        productIds.includes(detail.productId)
                    ).length;

                    filteredOrders.push({
                        orderId: order.id,
                        orderCode: order.code,
                        purchaseDate: order.purchaseDate,
                        customerName: order.customerName || 'N/A',
                        totalAmount: order.total || 0,
                        productCount: targetProductCount
                    });

                    totalRevenue += order.total || 0;
                }
            }
        }

        console.log(`✅ Tìm thấy ${filteredOrders.length} orders có product IDs: ${productIds.join(', ')}`);
        console.log(`💰 Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} VNĐ`);

        // Hiển thị chi tiết orders
        if (filteredOrders.length > 0) {
            console.log('\n📋 DANH SÁCH ORDERS:');
            console.log('='.repeat(100));
            
            filteredOrders.forEach((order, index) => {
                console.log(`${index + 1}. ${order.orderCode} - ${order.customerName}`);
                console.log(`   📅 ${order.purchaseDate}`);
                console.log(`   💰 ${order.totalAmount.toLocaleString('vi-VN')} VNĐ`);
                console.log(`   🛒 ${order.productCount} sản phẩm target`);
                console.log('');
            });
        }

        return {
            orders: filteredOrders,
            totalRevenue,
            orderCount: filteredOrders.length
        };

    } catch (error) {
        console.error('❌ Lỗi khi lấy orders:', error);
        throw error;
    }
}

// Function để chạy với product IDs cụ thể
async function main() {
    try {
        // Thay thế bằng product IDs thực tế bạn muốn tìm
        const targetProductIds = [7869442,7869637]; // Ví dụ product IDs
        
        const result = await getOrdersByProductIds(targetProductIds);
        
        console.log('\n📊 TỔNG KẾT:');
        console.log('='.repeat(50));
        console.log(`📦 Tổng số orders: ${result.orderCount}`);
        console.log(`💰 Tổng doanh thu: ${result.totalRevenue.toLocaleString('vi-VN')} VNĐ`);
        console.log(`📈 Doanh thu trung bình: ${result.orderCount > 0 ? (result.totalRevenue / result.orderCount).toLocaleString('vi-VN') : 0} VNĐ`);
        
    } catch (error) {
        console.error('Lỗi trong quá trình thực thi:', error);
        process.exit(1);
    }
}

// Chạy chương trình
if (require.main === module) {
    main();
}

export { getOrdersByProductIds };