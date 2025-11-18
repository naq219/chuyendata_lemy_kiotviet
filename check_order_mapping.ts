import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as fs from 'fs';
import * as path from 'path';

class LemydeClient {
    private baseUrl: string;
    private axios: any;
    
    constructor() {
        this.baseUrl = process.env.LEMYDE_API_URL || 'http://connect.lemyde.com';
        this.axios = axios.create({ baseURL: this.baseUrl });
        axiosRetry(this.axios, {
            retries: 3,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error: any) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
            },
        });
    }

    async query(sql: string): Promise<any[]> {
        try {
            const response = await this.axios.get('/get', {
                params: { sql },
            });

            if (response.data.status !== 1 || !response.data.data) {
                throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
            }

            return response.data.data;
        } catch (error) {
            console.error('Lemyde query failed:', error instanceof Error ? error.message : 'Unknown error', 'SQL:', sql);
            throw error;
        }
    }
}

interface OrderWithDetails {
    order_id: number;
    order_code: string;
    customer_id: number;
    total_amount: number;
    description: string;
    note: string;
    note_xuatkho: string;
    details: OrderDetail[];
}

interface OrderDetail {
    order_detail_id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    total: number;
}

interface MigrationMapping {
    orders: {
        [orderId: string]: {
            kiotvietId: number;
            kiotvietCode: string;
        };
    };
}

const lemydeClient = new LemydeClient();

async function getAllOrdersWithDetails(): Promise<OrderWithDetails[]> {
    console.log('Fetching orders and details from Lemyde API...');
    
    // SQL query để lấy orders và details theo pattern user cung cấp
    const sql = `
        SELECT 
            o.order_id,
            o.order_code,
            o.customer_id,
            o.total_amount,
            o.description,
            o.note,
            o.note_xuatkho,
            od.order_detail_id,
            od.product_id,
            od.quantity,
            od.price,
            od.total
        FROM orders o
        LEFT JOIN order_details od ON o.order_id = od.order_id
        ORDER BY o.order_id
    `;

    try {
        const results = await lemydeClient.query(sql);
        
        // Group details by order_id
        const ordersMap = new Map<number, OrderWithDetails>();
        
        for (const row of results) {
            const orderId = row.order_id;
            
            if (!ordersMap.has(orderId)) {
                ordersMap.set(orderId, {
                    order_id: orderId,
                    order_code: row.order_code,
                    customer_id: row.customer_id,
                    total_amount: row.total_amount,
                    description: row.description || '',
                    note: row.note || '',
                    note_xuatkho: row.note_xuatkho || '',
                    details: []
                });
            }
            
            // Add detail if it exists
            if (row.order_detail_id) {
                ordersMap.get(orderId)!.details.push({
                    order_detail_id: row.order_detail_id,
                    order_id: row.order_id,
                    product_id: row.product_id,
                    quantity: row.quantity,
                    price: row.price,
                    total: row.total
                });
            }
        }
        
        return Array.from(ordersMap.values());
    } catch (error) {
        console.error('Failed to fetch orders with details:', error);
        throw error;
    }
}

function filterLemydeOrders(orders: OrderWithDetails[]): OrderWithDetails[] {
    return orders.filter(order => {
        const expectedDescription = 'DHM' + (order.order_id ?? '') + '. ' + (order.note ?? '') + ' ' + (order.note_xuatkho ?? '');
        return order.description === expectedDescription;
    });
}

function loadMigrationMapping(): MigrationMapping {
    const mappingPath = path.join(process.cwd(), 'UI', 'data', 'migration_mapping.json');
    
    if (!fs.existsSync(mappingPath)) {
        throw new Error(`Migration mapping file not found at: ${mappingPath}`);
    }
    
    try {
        const content = fs.readFileSync(mappingPath, 'utf-8');
        return JSON.parse(content) as MigrationMapping;
    } catch (error) {
        throw new Error(`Failed to parse migration mapping file: ${error}`);
    }
}

function validateMigrationMapping(
    orders: OrderWithDetails[], 
    mapping: MigrationMapping
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Kiểm tra orders trong mapping có tồn tại trong database không
    for (const orderId in mapping.orders) {
        const orderExists = orders.some(order => order.order_id === parseInt(orderId));
        if (!orderExists) {
            errors.push(`Order ID ${orderId} trong mapping không tồn tại trong database`);
        }
    }

    // Kiểm tra orders có description DHM nhưng không có trong mapping
    const lemydeOrders = filterLemydeOrders(orders);
    for (const order of lemydeOrders) {
        const orderIdStr = order.order_id.toString();
        if (!mapping.orders[orderIdStr]) {
            errors.push(`Order ID ${orderIdStr} (DHM order) không có trong mapping`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

async function main() {
    try {
        console.log('Bắt đầu kiểm tra order mapping...');
        
        // Lấy toàn bộ orders và details
        const orders = await getAllOrdersWithDetails();
        console.log(`Đã lấy được ${orders.length} orders từ Lemyde`);
        
        // Lọc các orders DHM
        const lemydeOrders = filterLemydeOrders(orders);
        console.log(`Tìm thấy ${lemydeOrders.length} orders DHM`);
        
        // Load migration mapping
        const mapping = loadMigrationMapping();
        console.log(`Đã load mapping với ${Object.keys(mapping.orders).length} orders`);
        
        // Validate mapping
        const validation = validateMigrationMapping(orders, mapping);
        
        if (validation.isValid) {
            console.log('✅ Migration mapping hợp lệ');
        } else {
            console.log('❌ Migration mapping có lỗi:');
            validation.errors.forEach(error => console.log(`  - ${error}`));
        }
        
    } catch (error) {
        console.error('Lỗi khi chạy chương trình:', error);
        process.exit(1);
    }
}

// Chạy chương trình
if (require.main === module) {
    main();
}