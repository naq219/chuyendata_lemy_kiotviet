// ============================================================================
// lemyde.service.ts - Lemyde API Client Service
// ============================================================================

import axios from 'axios';
import { LEMYDE_API_URL } from '../utils/constants';

/**
 * Generic Lemyde query function
 * @param sql - SQL query string
 * @returns Query results as array of type T
 */
export async function lemydeQuery<T>(sql: string): Promise<T[]> {
  const response = await axios.get(LEMYDE_API_URL + '/get', {
    params: { sql },
  });

  if (response.data.status !== 1 || !response.data.data) {
    throw new Error(`Lemyde API error: ${JSON.stringify(response.data)}`);
  }

  return response.data.data as T[];
}

/**
 * Fetches customer data by ID
 * @param customerId - Customer ID in Lemyde
 * @returns Customer data
 */
export async function getCustomerById(customerId: number) {
  const sql = `
    SELECT id AS customer_id, name, phone, address
    FROM crm.customers
    WHERE id = ${customerId}
  `;
  const [customer] = await lemydeQuery<any>(sql);
  return customer;
}

/**
 * Fetches product data by ID
 * @param productId - Product ID in Lemyde
 * @returns Product data
 */
export async function getProductById(productId: number) {
  const sql = `
    SELECT id AS product_id, name, cost_price, retail_price, introduction, images
    FROM crm.products
    WHERE id = ${productId}
  `;
  const [product] = await lemydeQuery<any>(sql);
  return product;
}

/**
 * Fetches orders with optional filtering by IDs
 * @param orderIds - Optional array of order IDs to filter
 * @returns Array of orders
 */
export async function getOrders(orderIds?: string[]) {
  let whereCondition = '';

  if (orderIds && orderIds.length > 0) {
    // Filter by specific order IDs
    const idsArray = orderIds.map(id => id.trim()).filter(id => id.length > 0);
    if (idsArray.length > 0) {
      whereCondition = `AND o.id IN (${idsArray.join(',')})`;
    }
  } else {
    // Default filter: orders containing products with 'nck1' in name
    whereCondition = `AND o.id IN (
      SELECT DISTINCT do.order_id 
      FROM crm.detail_orders do
      JOIN crm.products p ON do.product_id = p.id
      WHERE p.name LIKE '%nck1%'
    )`;
  }

  const sql = `
    SELECT 
      o.id AS order_id,
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
    WHERE o.status = 1
      ${whereCondition}
    ORDER BY o.id DESC 
  `;

  return await lemydeQuery<any>(sql);
}

/**
 * Fetches order details (line items) for a specific order
 * @param orderId - Order ID in Lemyde
 * @returns Array of order detail items
 */
export async function getOrderDetails(orderId: number) {
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

  return await lemydeQuery<any>(sql);
}

/**
 * Updates order status to 5 and dvvc to 10, then verifies the change
 * @param orderId - Order ID to update
 * @returns Updated order verification result
 */
export async function updateOrderStatus(orderId: number) {
  // Update the order status and dvvc
  const updateSql = `
    UPDATE crm.orders 
    SET status = 5, dvvc = 10 
    WHERE id = ${orderId}
  `;

  await lemydeQuery<any>(updateSql);

  // Query the order to verify the update
  const verifySql = `
    SELECT id, status, dvvc, customer_id, date_created, total_amount
    FROM crm.orders
    WHERE id = ${orderId}
  `;

  const [updatedOrder] = await lemydeQuery<any>(verifySql);

  if (!updatedOrder) {
    throw new Error(`Không tìm thấy đơn hàng #${orderId} sau khi cập nhật`);
  }

  // Verify the status was changed correctly
  // Use loose equality to handle string/number differences from API
  if (updatedOrder.status != 5 || updatedOrder.dvvc != 10) {
    console.error('Verification failed. Updated order:', updatedOrder);
    throw new Error(`Cập nhật không thành công. Status: ${updatedOrder.status}, DVVC: ${updatedOrder.dvvc}`);
  }

  return updatedOrder;
}

/**
 * Inserts NCC ship data into the ncc_ship table
 * @param data - NCC ship data including order details and image URL
 * @returns Inserted record verification
 */
export async function insertNccShip(data: {
  order_id: number;
  ncc_orderid: string;
  ncc_bill_image: string;
  total_amount: number;
  money_received: number;
  free_ship: number;
  note: string;
  details: string;
}) {
  // Escape single quotes in strings for SQL
  const escapeSql = (str: string) => str.replace(/'/g, "''");

  const insertSql = `
    INSERT INTO crm.ncc_ship 
    (order_id, ncc_id, ncc_name, total_amount, money_received, free_ship, nccsstatus, note, details, ncc_bill_image, ncc_orderid)
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
        '${escapeSql(data.ncc_orderid)}'
    )
  `;

  console.log(insertSql);

  await lemydeQuery<any>(insertSql);

  // Verify the insert by querying the record
  const verifySql = `
    SELECT * FROM crm.ncc_ship
    WHERE order_id = ${data.order_id}
    ORDER BY id DESC
    LIMIT 1
  `;

  const [insertedRecord] = await lemydeQuery<any>(verifySql);

  if (!insertedRecord) {
    throw new Error(`Không tìm thấy bản ghi NCC ship cho order #${data.order_id} sau khi insert`);
  }

  return insertedRecord;
}
