const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Data directory
const DATA_DIR = './data';
const MAPPINGS_FILE = path.join(DATA_DIR, 'order_mappings.json');

// LEMYDE API CLIENT
class LemydeClient {
    constructor() {
        this.baseUrl = process.env.LEMYDE_API_URL || 'http://connect.lemyde.com';
        this.axios = axios.create({ baseURL: this.baseUrl });
        axiosRetry(this.axios, {
            retries: 3,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
            },
        });
    }

    async query(sql) {
        try {
            const response = await this.axios.get('/get', {
                params: { sql },
            });

            if (response.data.status !== 1 || !response.data.data) {
                throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
            }

            return response.data.data;
        } catch (error) {
            console.error('Lemyde query failed:', error.message, 'SQL:', sql);
            throw error;
        }
    }
}

const lemydeClient = new LemydeClient();

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Load order mappings
async function loadOrderMappings() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(MAPPINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Return empty object if file doesn't exist
        return {};
    }
}

// Save order mappings
async function saveOrderMappings(mappings) {
    try {
        await ensureDataDir();
        await fs.writeFile(MAPPINGS_FILE, JSON.stringify(mappings, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving mappings:', error);
        return false;
    }
}

// API Routes

// Get Lemyde orders (real data from Lemyde database)
app.get('/api/lemyde/orders', async (req, res) => {
    try {
        // SQL query từ main3.ts để lấy orders
        const sql = `
            SELECT 
                o.id AS order_id,
                o.customer_id,
                o.date_created,
                o.note,
                o.total_amount,
                c.name AS customer_name,
                c.phone AS customer_phone,
                c.address AS customer_address
            FROM crm.orders o
            JOIN crm.customers c ON o.customer_id = c.id
            WHERE o.status = 1
              AND o.id IN (
                SELECT DISTINCT do.order_id
                FROM crm.detail_orders do
                JOIN crm.products p ON do.product_id = p.id
                WHERE p.name LIKE '%nck1%'
              )
            ORDER BY o.id DESC
            LIMIT 100
        `;

        const orders = await lemydeClient.query(sql);

        res.json({
            success: true,
            orders: orders,
            count: orders.length
        });

    } catch (error) {
        console.error('Error fetching orders from Lemyde:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu orders từ Lemyde',
            error: error.message
        });
    }
});

// Transfer single order to KiotViet
app.post('/api/transfer/order', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu orderId'
            });
        }

        // Đây là nơi bạn sẽ tích hợp với code từ main3.ts để chuyển order sang KiotViet
        // Hiện tại tôi sẽ giả lập việc chuyển thành công
        
        // Tạo KiotViet order ID giả lập (trong thực tế sẽ là ID từ KiotViet trả về)
        const kiotvietOrderId = Math.floor(100000 + Math.random() * 900000);
        
        console.log(`Đã chuyển order ${orderId} sang KiotViet với ID: ${kiotvietOrderId}`);

        res.json({
            success: true,
            message: `Đã chuyển order ${orderId} thành công`,
            kiotvietOrderId: kiotvietOrderId
        });

    } catch (error) {
        console.error('Error transferring order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi chuyển order sang KiotViet',
            error: error.message
        });
    }
});

// Save order mappings
app.post('/api/mappings/save', async (req, res) => {
    try {
        const { mappings } = req.body;
        
        if (!mappings || typeof mappings !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu mappings không hợp lệ'
            });
        }

        const success = await saveOrderMappings(mappings);
        
        if (success) {
            res.json({
                success: true,
                message: 'Đã lưu mappings thành công'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lưu mappings'
            });
        }

    } catch (error) {
        console.error('Error saving mappings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu mappings',
            error: error.message
        });
    }
});

// Get current mappings
app.get('/api/mappings', async (req, res) => {
    try {
        const mappings = await loadOrderMappings();
        res.json({
            success: true,
            mappings: mappings
        });
    } catch (error) {
        console.error('Error loading mappings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải mappings',
            error: error.message
        });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên http://localhost:${PORT}`);
    console.log('Giao diện chuyển dữ liệu Lemyde → KiotViet đã sẵn sàng');
});

module.exports = app;