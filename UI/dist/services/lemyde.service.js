"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lemydeQuery = lemydeQuery;
exports.lemydeInsert = lemydeInsert;
exports.getCustomerById = getCustomerById;
exports.getProductById = getProductById;
exports.getOrders = getOrders;
exports.getOrderDetails = getOrderDetails;
exports.updateOrderStatus = updateOrderStatus;
exports.insertNccShip = insertNccShip;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../utils/constants");
async function lemydeQuery(sql) {
    const response = await axios_1.default.get(constants_1.LEMYDE_API_URL + '/get', {
        params: { sql },
    });
    if (response.data.status !== 1 || !response.data.data) {
        throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
    }
    return response.data.data;
}
async function lemydeInsert(sql) {
    const response = await axios_1.default.get(constants_1.LEMYDE_API_URL + '/sql/statement', {
        params: { sql, split: "###$" },
    });
    console.log('response.status');
    console.log(response);
    if (response.data.status !== 1) {
        throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
    }
    return response.data;
}
async function getCustomerById(customerId) {
    const sql = `
    SELECT id AS customer_id, name, phone, address
    FROM crm.customers
    WHERE id = ${customerId}
  `;
    const [customer] = await lemydeQuery(sql);
    return customer;
}
async function getProductById(productId) {
    const sql = `
    SELECT id AS product_id, name, cost_price, retail_price, introduction, images
    FROM crm.products
    WHERE id = ${productId}
  `;
    const [product] = await lemydeQuery(sql);
    return product;
}
async function getOrders(orderIds) {
    let whereCondition = '';
    if (orderIds && orderIds.length > 0) {
        const idsArray = orderIds.map(id => id.trim()).filter(id => id.length > 0);
        if (idsArray.length > 0) {
            whereCondition = `o.id IN (${idsArray.join(',')})`;
        }
    }
    else {
        whereCondition = `o.status = 1 AND o.id IN (
      SELECT DISTINCT do.order_id 
      FROM crm.detail_orders do
      JOIN crm.products p ON do.product_id = p.id
      WHERE p.name LIKE '%nck1%'
    )`;
    }
    const sql = `
    SELECT 
      o.id AS order_id,
      o.status as order_status,
      o.customer_id,
      o.date_created,
      o.shop_id,
      o.note,
      c.note_xuatkho,
      o.total_amount,
      c.name AS customer_name,
      c.phone AS customer_phone,
      c.address AS customer_address,
      c.nick_facebook AS customer_facebook,
      (
        SELECT JSON_ARRAYAGG(p.images) 
        FROM crm.detail_orders do
        JOIN crm.products p ON do.product_id = p.id
        WHERE do.order_id = o.id
      ) AS images
    FROM crm.orders o
    JOIN crm.customers c ON o.customer_id = c.id
    WHERE 
      ${whereCondition}
    ORDER BY o.id DESC 
  `;
    return await lemydeQuery(sql);
}
async function getOrderDetails(orderId) {
    const sql = `
    SELECT 
      do.id AS detail_order_id,
      do.product_id,
      p.name AS product_name,
      
      p.cost_price,
      p.retail_price,
      do.quantity,
      do.gia_ban,
      do.gia_nhap
    FROM crm.detail_orders do
    JOIN crm.products p ON do.product_id = p.id
    WHERE do.order_id = ${orderId}
    ORDER BY do.id 
  `;
    return await lemydeQuery(sql);
}
async function updateOrderStatus(orderId) {
    const updateSql = `
    UPDATE crm.orders 
    SET status = 5, dvvc = 10 
    WHERE id = ${orderId}
  `;
    await lemydeQuery(updateSql);
    const verifySql = `
    SELECT id, status, dvvc, customer_id, date_created, total_amount
    FROM crm.orders
    WHERE id = ${orderId}
  `;
    const [updatedOrder] = await lemydeQuery(verifySql);
    if (!updatedOrder) {
        throw new Error(`Không tìm thấy đơn hàng #${orderId} sau khi cập nhật`);
    }
    if (updatedOrder.status != 5 || updatedOrder.dvvc != 10) {
        console.error('Verification failed. Updated order:', updatedOrder);
        throw new Error(`Cập nhật không thành công. Status: ${updatedOrder.status}, DVVC: ${updatedOrder.dvvc}`);
    }
    return updatedOrder;
}
async function insertNccShip(data) {
    const escapeSql = (str) => str.replace(/'/g, "''");
    const insertSql = `
    INSERT INTO crm.ncc_ship 
    (order_id, ncc_id, ncc_name, total_amount, money_received, free_ship, nccsstatus, note, details, ncc_bill_image, ncc_orderid,date_create_bill)
    VALUES (
        ${data.order_id},
        1,
        'mgs',
        ${data.total_amount},
        ${data.money_received},
        ${data.free_ship},
        1,
        '${escapeSql(data.note || '')}',
        '${escapeSql(data.details)}',
        '${escapeSql(data.ncc_bill_image)}',
        '${escapeSql(data.ncc_orderid)}',
        '${escapeSql(data.date_create_bill)}'
    )
  `;
    console.log(insertSql);
    await lemydeInsert(insertSql);
    const verifySql = `
    SELECT * FROM crm.ncc_ship
    WHERE order_id = ${data.order_id}
    ORDER BY nccship_id DESC
    LIMIT 1
  `;
    const [insertedRecord] = await lemydeQuery(verifySql);
    if (!insertedRecord) {
        throw new Error(`Không tìm thấy bản ghi NCC ship cho order #${data.order_id} sau khi insert`);
    }
    return insertedRecord;
}
