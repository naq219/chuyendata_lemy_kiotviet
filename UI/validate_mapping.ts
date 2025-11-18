// // ============================================================================
// // routes/validate-mapping.ts
// // ============================================================================

// import express, { Request, Response } from 'express';
// import * as fs from 'fs';
// import * as path from 'path';
// import { KiotVietClient } from 'kiotviet-client-sdk';

// const DATA_DIR = './data';
// const OLD_MAPPING_FILE = path.join(DATA_DIR, 'migration_mapping_old.json');
// const NEW_MAPPING_FILE = path.join(DATA_DIR, 'migration_mapping.json');

// interface ValidationResult {
//   total: {
//     customers: number;
//     products: number;
//     orders: number;
//   };
//   valid: {
//     customers: number;
//     products: number;
//     orders: number;
//   };
//   invalid: {
//     customers: { id: string; kiotvietId: number; reason: string }[];
//     products: { id: string; kiotvietId: number; reason: string }[];
//     orders: { id: string; kiotvietId: number; reason: string }[];
//   };
//   cleanedMapping: {
//     customers: Record<number, number>;
//     products: Record<number, number>;
//     orders: Record<number, { kiotvietId: number; kiotvietOrderCode: string; createdAt: string }>;
//   };
// }

// // ✅ Export a *factory function* that returns a configured router
// export function createValidateRouter(kiotvietClient: KiotVietClient) {
//   const router = express.Router();

//   // ============================================================================
//   // API: Validate mapping
//   // ============================================================================

//   router.post('/api/validate-mapping', async (req: Request, res: Response) => {  // ⚠️ removed `/api` prefix
//     try {
//       if (!fs.existsSync(OLD_MAPPING_FILE)) {
//         return res.status(400).json({
//           success: false,
//           error: `File không tìm thấy: ${OLD_MAPPING_FILE}`,
//         });
//       }

//       const oldMapping = JSON.parse(fs.readFileSync(OLD_MAPPING_FILE, 'utf-8'));
//      // console.log('oldMapping', oldMapping);
      
//      const mappings = oldMapping.mappings || {};
// const customersMap = mappings.customers || {};
// const productsMap = mappings.products || {};
// const ordersMap = mappings.createdOrders || {};
// console.log('customersMap', customersMap.length);
// console.log('productsMap', productsMap.length);
// console.log('ordersMap', ordersMap.length);
// const result: ValidationResult = {
//   total: {
//     customers: Object.keys(customersMap).length,
//     products: Object.keys(productsMap).length,
//     orders: Object.keys(ordersMap).length,
//   },
//   valid: { customers: 0, products: 0, orders: 0 },
//   invalid: {
//     customers: [],
//     products: [],
//     orders: [],
//   },
//   cleanedMapping: {
//     customers: {},
//     products: {},
//     orders: {},
//   },
// };

//       console.log('📊 Bắt đầu validate mapping...');

//       // =========================================================================
//       // VALIDATE CUSTOMERS
//       // =========================================================================
//       console.log('🔍 Checking customers...');
//       for (const [lemydeId, kiotvietId] of Object.entries(customersMap || {})) {
//         console.log('Checking customer', lemydeId, kiotvietId);
//         try {
//           const customer = await kiotvietClient.customers.getById(kiotvietId as any);
          
//           console.log('id check =',`LY${String(lemydeId).padStart(6, '0')}`);
//           if (customer && customer.code === `LY${String(lemydeId).padStart(6, '0')}`) {
//             result.valid.customers++;
//             result.cleanedMapping.customers[Number(lemydeId)] = kiotvietId as number;
//           } else {
//             result.invalid.customers.push({
//               id: lemydeId,
//               kiotvietId: kiotvietId as number,
//               reason: 'Code không match hoặc customer không tồn tại',
//             });
//           }
//         } catch (error) {
//           console.log('error', error);
//           result.invalid.customers.push({
//             id: lemydeId,
//             kiotvietId: kiotvietId as number,
//             reason: 'Customer không tìm thấy ở KiotViet',
//           });
//         }
//         await new Promise((resolve) => setTimeout(resolve, 50));
//       }

//       //  fs.writeFileSync("result_check_naq.json", JSON.stringify(result, null, 2));
//       //  return 

//       // =========================================================================
//       // VALIDATE PRODUCTS
//       // =========================================================================
//       console.log('🔍 Checking products...');
//       for (const [lemydeId, kiotvietId] of Object.entries(productsMap || {})) {
//         console.log('Checking product', lemydeId, kiotvietId);
//         try {
//           const product = await kiotvietClient.products.getById(kiotvietId as any);

//           if (product && product.code === `LY${String(lemydeId).padStart(6, '0')}`) {
//             result.valid.products++;
//             result.cleanedMapping.products[Number(lemydeId)] = kiotvietId as number;
//           } else {
//             result.invalid.products.push({
//               id: lemydeId,
//               kiotvietId: kiotvietId as number,
//               reason: `Code không match. Expected: LY${String(lemydeId).padStart(6, '0')}, Got: ${product?.code}`,
//             });
//           }
//         } catch (error) {
//           result.invalid.products.push({
//             id: lemydeId,
//             kiotvietId: kiotvietId as number,
//             reason: 'Product không tìm thấy ở KiotViet',
//           });
//         }
//         await new Promise((resolve) => setTimeout(resolve, 50));
//       }

//       // =========================================================================
//       // VALIDATE ORDERS
//       // =========================================================================
//       console.log('🔍 Checking orders...');
//       for (const [lemydeOrderId, orderData] of Object.entries(ordersMap || {})) {
//         console.log('Checking order', lemydeOrderId, orderData);
//         try {
//           const order = await kiotvietClient.orders.getById((orderData as any).kiotvietOrderId);

//           if (order && order.code === (orderData as any).kiotvietOrderCode) {
//             result.valid.orders++;
//             result.cleanedMapping.orders[Number(lemydeOrderId)] = orderData as any;
//           } else {
//             result.invalid.orders.push({
//               id: lemydeOrderId,
//               kiotvietId: (orderData as any).kiotvietOrderId,
//               reason: 'Order code không match hoặc order không tồn tại',
//             });
//           }
//         } catch (error) {
//           result.invalid.orders.push({
//             id: lemydeOrderId,
//             kiotvietId: (orderData as any).kiotvietOrderId,
//             reason: 'Order không tìm thấy ở KiotViet',
//           });
//         }
//         await new Promise((resolve) => setTimeout(resolve, 50));
//       }

//       fs.writeFileSync(NEW_MAPPING_FILE, JSON.stringify(result.cleanedMapping, null, 2));
//       fs.writeFileSync("result_check_naq.json", JSON.stringify(result, null, 2));
//       res.json({
//         success: true,
//         result,
//         message: `✅ Validation hoàn tất. Cleaned mapping đã được lưu vào ${NEW_MAPPING_FILE}`,
//       });
//     } catch (error) {
//       const err = error as Error;
//       res.status(500).json({
//         success: false,
//         error: err.message,
//       });
//     }
//   });

//   // ============================================================================
//   // API: Get validation report
//   // ============================================================================

//   router.get('/validation-report', (req: Request, res: Response) => {  // ⚠️ removed `/api`
//     try {
//       if (!fs.existsSync(NEW_MAPPING_FILE)) {
//         return res.status(400).json({
//           success: false,
//           error: 'Cleaned mapping chưa được tạo. Hãy chạy validation trước.',
//         });
//       }

//       const cleanedMapping = JSON.parse(fs.readFileSync(NEW_MAPPING_FILE, 'utf-8'));

//       res.json({
//         success: true,
//         data: {
//           customers: Object.keys(cleanedMapping.customers).length,
//           products: Object.keys(cleanedMapping.products).length,
//           orders: Object.keys(cleanedMapping.orders).length,
//         },
//       });
//     } catch (error) {
//       const err = error as Error;
//       res.status(500).json({
//         success: false,
//         error: err.message,
//       });
//     }
//   });

//   // ✅ Critical: return the configured router
//   return router;
// }

// // Optional: if you ever need a default/unconfigured router, you can add:
// // export default express.Router();