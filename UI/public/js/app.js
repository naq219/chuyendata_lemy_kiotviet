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
    },

    mounted() {
        // Load orders when component mounts if needed
    },
}).mount('#app');
