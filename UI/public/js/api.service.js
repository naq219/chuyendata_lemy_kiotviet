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

    /**
     * Changes order status to 5 and dvvc to 10
     * @param {number} orderId - Lemyde order ID
     * @returns {Promise} API response
     */
    async changeOrderStatus(orderId) {
        const response = await fetch(`${this.baseURL}/api/change-order-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
        });
        return await response.json();
    }

    /**
     * Uploads image to external image service
     * @param {string} imageBase64 - Base64 encoded image
     * @param {string} filename - Image filename
     * @returns {Promise} API response
     */
    async uploadImage(imageBase64, filename) {
        const response = await fetch('https://s1.vq.id.vn/p405/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project: 'kiotviet-migrate',
                filename: filename,
                provider: 'github',
                image: imageBase64,
            }),
        });
        return await response.json();
    }

    /**
     * Inserts NCC ship data to database
     * @param {Object} nccShipData - NCC ship data
     * @returns {Promise} API response
     */
    async insertNccShip(nccShipData) {

       let abc = JSON.stringify(nccShipData)
        console.log(JSON.stringify(nccShipData, null, 2));


        const response = await fetch(`${this.baseURL}/api/ncc-ship`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: abc,
        });
        return await response.json();
    }


}
