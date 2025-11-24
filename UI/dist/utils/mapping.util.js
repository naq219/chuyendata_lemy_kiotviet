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
exports.ensureDataDir = ensureDataDir;
exports.loadMapping = loadMapping;
exports.saveMapping = saveMapping;
exports.deleteOrderFromMapping = deleteOrderFromMapping;
exports.isOrderMigrated = isOrderMigrated;
exports.getKiotVietOrderInfo = getKiotVietOrderInfo;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("./constants");
function ensureDataDir() {
    if (!fs.existsSync(constants_1.DATA_DIR)) {
        fs.mkdirSync(constants_1.DATA_DIR, { recursive: true });
    }
}
function loadMapping() {
    ensureDataDir();
    const mappingFilePath = path.join(constants_1.DATA_DIR, constants_1.MAPPING_FILE_NAME);
    if (fs.existsSync(mappingFilePath)) {
        const mapping = JSON.parse(fs.readFileSync(mappingFilePath, 'utf-8'));
        if (!mapping.orders)
            mapping.orders = {};
        if (!mapping.customers)
            mapping.customers = {};
        if (!mapping.products)
            mapping.products = {};
        return mapping;
    }
    return { customers: {}, products: {}, orders: {} };
}
function saveMapping(mapping) {
    ensureDataDir();
    const mappingFilePath = path.join(constants_1.DATA_DIR, constants_1.MAPPING_FILE_NAME);
    fs.writeFileSync(mappingFilePath, JSON.stringify(mapping, null, 2));
}
function deleteOrderFromMapping(orderId) {
    const mapping = loadMapping();
    if (mapping.orders[orderId]) {
        delete mapping.orders[orderId];
        saveMapping(mapping);
        console.log(`✅ Deleted order ${orderId} from mapping`);
    }
    else {
        console.warn(`⚠️  Order ${orderId} not found in mapping`);
    }
    return mapping;
}
function isOrderMigrated(orderId) {
    const mapping = loadMapping();
    return !!mapping.orders[orderId];
}
function getKiotVietOrderInfo(orderId) {
    const mapping = loadMapping();
    return mapping.orders[orderId] || null;
}
