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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const migration_routes_1 = __importDefault(require("./routes/migration.routes"));
const kiotviet_service_1 = require("./services/kiotviet.service");
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
function printRoutes(stack, prefix = '') {
    stack.forEach((layer) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            console.log(`📍 Route: ${methods} ${prefix}${layer.route.path}`);
        }
        else if (layer.name === 'router' && layer.handle.stack) {
            const routerPrefix = layer.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
            printRoutes(layer.handle.stack, prefix + routerPrefix);
        }
    });
}
async function initializeServices() {
    try {
        (0, kiotviet_service_1.initKiotVietClient)();
        await (0, kiotviet_service_1.initBranchId)();
        console.log('✅ Services initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize services:', error);
    }
}
initializeServices();
app.use('/api', orders_routes_1.default);
app.use('/api', migration_routes_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📋 Registered Routes:');
    printRoutes(app._router.stack);
});
exports.default = app;
