// ============================================================================
// mapping.util.ts - Mapping File Operations
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { DATA_DIR, MAPPING_FILE_NAME } from './constants';

/**
 * Interface for migration mapping structure
 */
export interface MigrationMapping {
    customers: Record<number, number>;
    products: Record<number, number>;
    orders: Record<number, { kiotvietId: number; kiotvietCode: string }>;
}

/**
 * Ensures data directory exists
 */
export function ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

/**
 * Loads mapping from JSON file
 * @returns Migration mapping object
 */
export function loadMapping(): MigrationMapping {
    ensureDataDir();
    const mappingFilePath = path.join(DATA_DIR, MAPPING_FILE_NAME);

    if (fs.existsSync(mappingFilePath)) {
        const mapping = JSON.parse(fs.readFileSync(mappingFilePath, 'utf-8'));
        // Ensure all required properties exist
        if (!mapping.orders) mapping.orders = {};
        if (!mapping.customers) mapping.customers = {};
        if (!mapping.products) mapping.products = {};
        return mapping;
    }

    return { customers: {}, products: {}, orders: {} };
}

/**
 * Saves mapping to JSON file
 * @param mapping - Migration mapping to save
 */
export function saveMapping(mapping: MigrationMapping): void {
    ensureDataDir();
    const mappingFilePath = path.join(DATA_DIR, MAPPING_FILE_NAME);
    fs.writeFileSync(mappingFilePath, JSON.stringify(mapping, null, 2));
}

/**
 * Deletes an order from the mapping
 * @param orderId - Lemyde order ID to delete
 * @returns Updated mapping
 */
export function deleteOrderFromMapping(orderId: number): MigrationMapping {
    const mapping = loadMapping();

    if (mapping.orders[orderId]) {
        delete mapping.orders[orderId];
        saveMapping(mapping);
        console.log(`✅ Deleted order ${orderId} from mapping`);
    } else {
        console.warn(`⚠️  Order ${orderId} not found in mapping`);
    }

    return mapping;
}

/**
 * Checks if an order has been migrated
 * @param orderId - Lemyde order ID
 * @returns True if order exists in mapping
 */
export function isOrderMigrated(orderId: number): boolean {
    const mapping = loadMapping();
    return !!mapping.orders[orderId];
}

/**
 * Gets KiotViet order info from mapping
 * @param orderId - Lemyde order ID
 * @returns KiotViet order info or null
 */
export function getKiotVietOrderInfo(orderId: number): { kiotvietId: number; kiotvietCode: string } | null {
    const mapping = loadMapping();
    return mapping.orders[orderId] || null;
}
