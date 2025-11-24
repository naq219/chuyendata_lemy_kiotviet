import * as dotenv from 'dotenv';
dotenv.config();

// ============================================================================
// constants.ts - Application Constants
// ============================================================================

/**
 * Lemyde API Configuration
 */
export const LEMYDE_API_URL = process.env.LEMYDE_API_URL || 'http://connect.lemyde.com';

/**
 * Data Directory Configuration
 */
export const DATA_DIR = './data';
export const MAPPING_FILE_NAME = 'migration_mapping.json';

/**
 * Hard mapping: Lemyde shop_id -> KiotViet saleChannelId
 */
export const SHOP_CHANNEL_MAPPING: Record<number, number> = {
    2: 228306,
    4: 228300,
    34: 229584,
    3: 228304,
    10: 228307
};

/**
 * KiotViet Configuration
 */
export const KIOTVIET_CONFIG = {
    CLIENT_ID: process.env.KIOTVIET_CLIENT_ID!,
    CLIENT_SECRET: process.env.KIOTVIET_CLIENT_SECRET!,
    RETAILER_NAME: process.env.KIOTVIET_RETAILER_NAME!,
};

/**
 * KiotViet Product Configuration
 */
export const PRODUCT_CONFIG = {
    CATEGORY_ID: 1477260,
    DEFAULT_UNIT: 'Cái',
    IMAGES_BASE_URL: 'https://files.lemyde.com/uploads/',
};

/**
 * Code Generation Patterns
 */
export const CODE_PATTERNS = {
    CUSTOMER_PREFIX: 'LY',
    CUSTOMER_PADDING: 6,
    PRODUCT_PREFIX: 'MY',
    PRODUCT_PADDING: 6,
    ORDER_PREFIX: 'DHM',
};
