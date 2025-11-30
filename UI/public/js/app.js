// ============================================================================
// app.js - Vue Application
// ============================================================================

const { createApp } = Vue;

// Initialize API Service
// const api = new ApiService('https://s1.vq.id.vn/p3501');
const api = new ApiService('http://localhost:3000');

createApp({
    data() {
        return {
            orders: [],
            loading: false,
            migratedCount: 0,
            failedCount: 0,
            mapping: { customers: {}, products: {}, orders: {} },
            buttonsUnlocked: true,
            unlockClickCount: 88,
            searchOrderIds: '',
            showFacebookInfo: true,
            copyNotification: '',
            // Confirmation modal for remigration
            showConfirmModal: false,
            confirmModalOrder: null,
            // NCC Ship dialog
            showNccShipModal: false,
            nccShipOrder: null,
            nccShipImage: null, // Base64 image data
            nccShipImagePreview: null, // Preview URL
            nccOrderId: '',
            nccOrderDate: '',
            uploadingNccShip: false,

        };
    },

    computed: {
        totalOrders() {
            return this.orders.length;
        },
        progressPercent() {
            if (this.totalOrders === 0) return 0;
            return Math.round((this.migratedCount / this.totalOrders) * 100);
        },
    },

    methods: {
        mapOrderStatus(code) {
            const mapping = {

                1: "Đang Order",
                2: "Gửi Ship",
                3: "Đã Nhận",
                4: "Đã huỷ",
                5: "Lấy hàng",
            };
            return mapping[code] || "Không rõ";
        },

        unlockButtons() {
            this.unlockClickCount++;
            if (this.unlockClickCount >= 5) {
                this.buttonsUnlocked = true;
            }
        },

        /**
         * Loads orders from API
         */
        async loadOrders() {
            this.loading = true;
            try {
                const result = await api.fetchOrders();

                if (result.success) {
                    this.orders = result.data.map(o => ({
                        ...o,
                        status: 'pending',
                        migrated: false,
                        migrating: false,
                        error: null,
                        products: [],
                    }));

                    await this.loadMapping();

                    for (const order of this.orders) {
                        await this.loadOrderProducts(order);

                        if (this.mapping.orders && this.mapping.orders[order.order_id]) {
                            order.migrated = true;
                            order.status = 'success';
                            order.kiotvietOrderCode = this.mapping.orders[order.order_id].kiotvietCode;
                            order.kiotvietOrderId = this.mapping.orders[order.order_id].kiotvietId;
                        }
                    }
                } else {
                    alert('Lỗi: ' + result.error);
                }
            } catch (error) {
                alert('Lỗi kết nối: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Searches orders by IDs
         */
        async searchOrders() {
            if (!this.searchOrderIds.trim()) {
                alert('Vui lòng nhập order ID để tìm kiếm');
                return;
            }

            this.loading = true;
            try {
                const orderIds = this.searchOrderIds
                    .split(',')
                    .map(id => id.trim())
                    .filter(id => id.length > 0);

                if (orderIds.length === 0) {
                    alert('Không có order ID hợp lệ');
                    return;
                }

                const result = await api.fetchOrders(orderIds.join(','));

                if (result.success) {
                    this.orders = result.data.map(o => ({
                        ...o,
                        status: 'pending',
                        migrated: false,
                        migrating: false,
                        error: null,
                        products: [],
                    }));

                    await this.loadMapping();

                    for (const order of this.orders) {
                        await this.loadOrderProducts(order);

                        if (this.mapping.orders && this.mapping.orders[order.order_id]) {
                            order.migrated = true;
                            order.status = 'success';
                            order.kiotvietOrderCode = this.mapping.orders[order.order_id].kiotvietCode;
                            order.kiotvietOrderId = this.mapping.orders[order.order_id].kiotvietId;
                        }
                    }
                } else {
                    alert('Lỗi: ' + result.error);
                }
            } catch (error) {
                alert('Lỗi kết nối: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Loads products for an order
         */
        async loadOrderProducts(order) {
            try {
                const result = await api.fetchOrderDetails(order.order_id);
                if (result.success) {
                    order.products = result.data;
                }
            } catch (error) {
                console.error('Failed to load products:', error);
            }
        },

        /**
         * Migrates an order
         */
        async migrateOrder(order) {
            order.status = 'migrating';
            order.migrating = true;
            order.error = null;

            try {
                const result = await api.migrateOrder({
                    orderId: order.order_id,
                    customerId: order.customer_id,
                    orderDetails: order.products,
                    shopId: order.shop_id,
                    note_xuatkho: order.note_xuatkho,
                    note: order.note,
                });

                if (result.success) {
                    order.status = 'success';
                    order.migrated = true;
                    order.kiotvietOrderCode = result.data.kiotvietOrderCode;
                    order.kiotvietOrderId = result.data.kiotvietOrderId;
                    this.migratedCount++;
                    await this.loadMapping();
                } else {
                    order.status = 'error';
                    order.error = result.error;
                    this.failedCount++;
                }
            } catch (error) {
                order.status = 'error';
                order.error = error.message;
                this.failedCount++;
            } finally {
                order.migrating = false;
            }
        },

        /**
         * Shows confirmation modal for remigration
         */
        showRemigrateConfirm(order) {
            this.confirmModalOrder = order;
            this.showConfirmModal = true;
        },

        /**
         * Cancels remigration
         */
        cancelRemigrate() {
            this.showConfirmModal = false;
            this.confirmModalOrder = null;
        },

        /**
         * Confirms and executes remigration
         */
        async confirmRemigrate() {
            const order = this.confirmModalOrder;
            this.showConfirmModal = false;
            this.confirmModalOrder = null;

            if (!order) return;

            order.status = 'migrating';
            order.migrating = true;
            order.error = null;
            order.migrated = false;

            try {
                const result = await api.remigrateOrder({
                    orderId: order.order_id,
                    customerId: order.customer_id,
                    orderDetails: order.products,
                    shopId: order.shop_id,
                    note_xuatkho: order.note_xuatkho,
                    note: order.note,
                });

                if (result.success) {
                    order.status = 'success';
                    order.migrated = true;
                    order.kiotvietOrderCode = result.data.kiotvietOrderCode;
                    order.kiotvietOrderId = result.data.kiotvietOrderId;
                    await this.loadMapping();
                    this.showCopyNotification('✅ Remigrate thành công!');
                } else {
                    order.status = 'error';
                    order.error = result.error;
                    this.failedCount++;
                }
            } catch (error) {
                order.status = 'error';
                order.error = error.message;
                this.failedCount++;
            } finally {
                order.migrating = false;
            }
        },

        /**
         * Loads migration mapping
         */
        async loadMapping() {
            try {
                const result = await api.fetchMapping();
                if (result.success) {
                    this.mapping = result.data;
                    this.migratedCount = Object.keys(this.mapping.orders).length;
                }
            } catch (error) {
                console.error('Failed to load mapping:', error);
            }
        },

        /**
         * Downloads mapping file
         */
        downloadMapping() {
            const dataStr = JSON.stringify(this.mapping, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `migration_mapping_${new Date().getTime()}.json`;
            link.click();
        },

        /**
         * Formats date
         */
        formatDate(date) {
            return new Date(date).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        },

        /**
         * Formats currency
         */
        formatCurrency(value) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(value);
        },

        /**
         * Returns status label
         */
        statusLabel(status) {
            const labels = {
                pending: '⏳ Chưa bắt đầu',
                migrating: '⏳ Đang migrate',
                success: '✅ Thành công',
                error: '❌ Lỗi',
            };
            return labels[status] || '⏳ Chưa biết';
        },

        /**
         * Copies order info to clipboard
         */
        copyOrderInfo(order) {
            console.log(order);
            let info = `Đơn ${order.order_id}\n`;
            info += `KH: ${order.customer_name} (${order.customer_phone})\n`;
            info += `${order.customer_address || 'Không có địa chỉ'}\n`;

            const ghiChu = (order.note || '') + ' ' + (order.note_xuatkho || '');
            if (ghiChu.trim()) {
                info += `Ghi Chú: ${ghiChu.trim()}\n`;
            }

            info += `${this.formatCurrency(order.total_amount)}\n`;

            if (order.products && order.products.length > 0) {
                info += `Sản phẩm (${order.products.length}):\n`;
                order.products.slice(0, 4).forEach(p => {
                    info += `• SL ${p.quantity} - ${p.product_name} - ${this.formatCurrency(p.gia_ban)}\n`;
                });

                if (order.products.length > 4) {
                    info += `• ... và ${order.products.length - 4} sản phẩm khác\n`;
                }
            }

            navigator.clipboard.writeText(info)
                .then(() => {
                    this.showCopyNotification('✅ Đã copy thông tin đơn hàng vào clipboard!');
                })
                .catch(err => {
                    console.error('Lỗi copy:', err);
                    this.showCopyNotification('❌ Lỗi khi copy thông tin');
                });
        },

        /**
         * Copies order details to JSON format to clipboard
         */
        copyOrderDetailsToJson(order) {
            console.log(order);
            const oneLine = {
                orders: {
                    order_id: order.order_id,
                    total_amount: order.total_amount,

                    // Các trường "đã nhận" và "order_shipper_lb_id dvvc" không có sẵn trực tiếp trong đối tượng order
                    // Nếu cần, bạn sẽ phải bổ sung dữ liệu này từ nguồn khác hoặc API
                },
                products: order.products.map(p => ({
                    detail_order_id: p.detail_order_id,
                    product_id: p.product_id,
                    quantity: p.quantity,
                    gianhap: p.gia_nhap,
                    gia_ban: p.gia_ban,
                    product_name: p.product_name,
                })),
            };

            const jsonOutput = JSON.stringify(oneLine);

            navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2))
                .then(() => {
                    this.showCopyNotification('✅ Đã copy JSON chi tiết đơn hàng vào clipboard!');
                })
                .catch(err => {
                    console.error('Lỗi copy JSON:', err);
                    this.showCopyNotification('❌ Lỗi khi copy JSON chi tiết đơn hàng');
                });
        },

        /**
         * Shows copy notification
         */
        showCopyNotification(message) {
            this.copyNotification = message;
            setTimeout(() => {
                this.copyNotification = '';
            }, 3000);
        },

        /**
         * Changes order status to 5 and dvvc to 10
         */
        async changeStatus(order) {
            if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái đơn hàng #${order.order_id} không?\n\nĐơn hàng sẽ được cập nhật:\n- Status: 5\n- DVVC: 10`)) {
                return;
            }

            order.migrating = true;
            order.error = null;

            try {
                const result = await api.changeOrderStatus(order.order_id);

                if (result.success) {
                    this.showCopyNotification(`✅ ${result.message}`);
                    order.status = 'success';
                } else {
                    order.error = result.error;
                    this.showCopyNotification(`❌ Lỗi: ${result.error}`);
                }
            } catch (error) {
                order.error = error.message;
                this.showCopyNotification(`❌ Lỗi kết nối: ${error.message}`);
            } finally {
                order.migrating = false;
            }
        },

        /**
         * Opens NCC Ship dialog
         */
        openNccShipDialog(order) {
            this.nccShipOrder = order;
            this.showNccShipModal = true;
            this.nccShipImage = null;
            this.nccShipImagePreview = null;
            this.nccOrderId = '';
            this.nccOrderDate = '';
        
        },

        /**
         * Closes NCC Ship dialog
         */
        closeNccShipDialog() {
            this.showNccShipModal = false;
            this.nccShipOrder = null;
            this.nccShipImage = null;
            this.nccShipImagePreview = null;
            this.nccOrderId = '';
            this.nccOrderDate = '';
            this.uploadingNccShip = false;
        },

        /**
         * Handles image upload from file input
         */
        async handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            try {
                await this.convertToWebP(file);
            } catch (error) {
                this.showCopyNotification('❌ Lỗi xử lý ảnh: ' + error.message);
            }
        },

        /**
         * Handles image paste event
         */
        async handleImagePaste(event) {
            const items = event.clipboardData?.items;
            if (!items) return;

            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    if (file) {
                        try {
                            await this.convertToWebP(file);
                        } catch (error) {
                            this.showCopyNotification('❌ Lỗi xử lý ảnh: ' + error.message);
                        }
                        break;
                    }
                }
            }
        },

        /**
         * Converts image to WebP and resizes if needed
         */
        async convertToWebP(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();

                    img.onload = () => {
                        // Create canvas
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Calculate new dimensions (max 2000px)
                        let width = img.width;
                        let height = img.height;
                        const maxSize = 2000;

                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = (height / width) * maxSize;
                                width = maxSize;
                            } else {
                                width = (width / height) * maxSize;
                                height = maxSize;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Draw and convert to WebP
                        ctx.drawImage(img, 0, 0, width, height);

                        // Get base64 WebP data
                        const webpDataUrl = canvas.toDataURL('image/webp', 0.9);

                        // Extract base64 string (remove data:image/webp;base64, prefix)
                        const base64Data = webpDataUrl.split(',')[1];

                        this.nccShipImage = base64Data;
                        this.nccShipImagePreview = webpDataUrl;

                        this.showCopyNotification('✅ Ảnh đã được tải và chuyển đổi');
                        resolve();
                    };

                    img.onerror = () => {
                        reject(new Error('Không thể tải ảnh'));
                    };

                    img.src = e.target.result;
                };

                reader.onerror = () => {
                    reject(new Error('Không thể đọc file'));
                };

                reader.readAsDataURL(file);
            });
        },

        /**
         * Uploads NCC ship data
         */
        // Thay thế hàm uploadNccShip trong app.js

        /**
         * Uploads NCC ship data
         */
        async uploadNccShip() {
            // Check for missing information
            const missingInfo = [];
            if (!this.nccShipImage) missingInfo.push('Ảnh hóa đơn');
            if (!this.nccOrderId || !this.nccOrderId.trim()) missingInfo.push('Mã đơn NCC');
            if (!this.nccOrderDate) missingInfo.push('Ngày NCC xuất đơn');

            if (missingInfo.length > 0) {
                const message = `Các thông tin sau chưa được nhập:\n- ${missingInfo.join('\n- ')}\n\nBạn có chắc chắn muốn tiếp tục upload không?`;
                if (!confirm(message)) {
                    return;
                }
            }

            this.uploadingNccShip = true;

            try {
                let imageUrl = '';

                // Step 1: Upload image (only if exists)
                if (this.nccShipImage) {
                    const timestamp = Date.now();
                    const filename = `order_${this.nccShipOrder.order_id}_${timestamp}.webp`;

                    const uploadResult = await api.uploadImage(this.nccShipImage, filename);

                    if (!uploadResult.success) {
                        throw new Error(uploadResult.message || 'Upload ảnh thất bại');
                    }

                    imageUrl = uploadResult.data.url;
                }

                // Step 2: Prepare details JSON
                const details = {
                    products: this.nccShipOrder.products.map(p => ({
                        product_id: p.product_id,
                        name: p.product_name,
                        quantity: p.quantity,
                        gia_ban: p.gia_ban,
                        gia_nhap: p.gia_nhap,
                    })),
                };

                // Step 3: Convert date to timestamp
                // Các tùy chọn dưới đây, chọn một cái phù hợp với backend:

                // OPTION A: Timestamp theo milliseconds (JavaScript)
                let dateTimestamp = null;
                
                    const date = new Date(`${this.nccOrderDate}T00:00:00`);
                    const mysqlTimestamp = date.toISOString().slice(0, 19).replace('T', ' ');
                    dateTimestamp = mysqlTimestamp;
                
                    console.log(dateTimestamp)



                // OPTION B: Timestamp theo giây (Unix timestamp)
                // let dateTimestamp = null;
                // if (this.nccOrderDate) {
                //     dateTimestamp = Math.floor(new Date(`${this.nccOrderDate}T00:00:00`).getTime() / 1000);
                // }

                // OPTION C: Giữ nguyên định dạng datetime string (nếu backend xử lý được)
                // let dateTimestamp = this.nccOrderDate ? `${this.nccOrderDate} 00:00:00` : null;

                // Step 4: Insert to database
                const insertResult = await api.insertNccShip({
                    order_id: this.nccShipOrder.order_id,
                    ncc_orderid: this.nccOrderId,
                    date_create_bill: dateTimestamp, // Gửi timestamp thay vì string
                    ncc_bill_image: imageUrl,
                    total_amount: this.nccShipOrder.total_amount,
                    money_received: this.nccShipOrder.money_received || 0,
                    free_ship: this.nccShipOrder.free_ship || 0,
                    note: this.nccShipOrder.note || '',
                    details: JSON.stringify(details),
                });

                if (insertResult.success) {
                    this.showCopyNotification('✅ Đã thêm NCC ship thành công!');
                    this.closeNccShipDialog();
                } else {
                    throw new Error(insertResult.error || 'Lưu dữ liệu thất bại');
                }
            } catch (error) {
                this.showCopyNotification('❌ Lỗi: ' + error.message);
            } finally {
                this.uploadingNccShip = false;
            }
        },
    },

    mounted() {
        // Load orders when component mounts if needed
    },
}).mount('#app');
