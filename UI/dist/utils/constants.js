"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODE_PATTERNS = exports.PRODUCT_CONFIG = exports.KIOTVIET_CONFIG = exports.SHOP_CHANNEL_MAPPING = exports.MAPPING_FILE_NAME = exports.DATA_DIR = exports.LEMYDE_API_URL = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.LEMYDE_API_URL = process.env.LEMYDE_API_URL || 'http://connect.lemyde.com';
exports.DATA_DIR = './data';
exports.MAPPING_FILE_NAME = 'migration_mapping.json';
exports.SHOP_CHANNEL_MAPPING = {
    2: 228306,
    4: 228300,
    34: 229584,
    3: 228304,
    10: 228307
};
exports.KIOTVIET_CONFIG = {
    CLIENT_ID: process.env.KIOTVIET_CLIENT_ID,
    CLIENT_SECRET: process.env.KIOTVIET_CLIENT_SECRET,
    RETAILER_NAME: process.env.KIOTVIET_RETAILER_NAME,
};
exports.PRODUCT_CONFIG = {
    CATEGORY_ID: 1477260,
    DEFAULT_UNIT: 'Cái',
    IMAGES_BASE_URL: 'https://files.lemyde.com/uploads/',
};
exports.CODE_PATTERNS = {
    CUSTOMER_PREFIX: 'LY',
    CUSTOMER_PADDING: 6,
    PRODUCT_PREFIX: 'MY',
    PRODUCT_PADDING: 6,
    ORDER_PREFIX: 'DHM',
};
