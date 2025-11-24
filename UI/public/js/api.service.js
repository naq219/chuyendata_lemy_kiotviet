// ============================================================================
// api.service.js - API Service Layer
// ============================================================================

class ApiService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Fetches orders from the API
     * @param {string} orderIds - Optional comma-separated order IDs
     * @returns {Promise} API response
     */
    async fetchOrders(orderIds = null) {
        const url = orderIds
            ? `${this.baseURL}/api/orders?ids=${orderIds}`
            : `${this.baseURL}/api/orders`;

        const response = await fetch(url);
        return await response.json();
    }

    /**
     * Fetches order details for a specific order
     * @param {number} orderId - Order ID
     * @returns {Promise} API response
     */
    async fetchOrderDetails(orderId) {
        const response = await fetch(`${this.baseURL}/api/order-details/${orderId}`);
        return await response.json();
    }

    /**
     * Migrates an order to KiotViet
     * @param {Object} orderData - Order migration data
     * @returns {Promise} API response
     */
    async migrateOrder(orderData) {
        const response = await fetch(`${this.baseURL}/api/migrate-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        return await response.json();
    }

    /**
     * Re-migrates an order (deletes and migrates again)
     * @param {Object} orderData - Order re-migration data
     * @returns {Promise} API response
     */
    async remigrateOrder(orderData) {
        const response = await fetch(`${this.baseURL}/api/remigrate-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        return await response.json();
    }

    /**
     * Fetches current migration mapping
     * @returns {Promise} API response
     */
    async fetchMapping() {
        const response = await fetch(`${this.baseURL}/api/mapping`);
        return await response.json();
    }

    /**
     * Deletes an order from KiotViet
     * @param {number} kiotvietOrderId - KiotViet order ID
     * @returns {Promise} API response
     */
    async deleteKiotVietOrder(kiotvietOrderId) {
        const response = await fetch(`${this.baseURL}/api/kiotviet/order/${kiotvietOrderId}`, {
            method: 'DELETE',
        });
        return await response.json();
    }

    /**
     * Removes an order from mapping
     * @param {number} orderId - Lemyde order ID
     * @returns {Promise} API response
     */
    async deleteMappingOrder(orderId) {
        const response = await fetch(`${this.baseURL}/api/mapping/order/${orderId}`, {
            method: 'DELETE',
        });
        return await response.json();
    }
}
