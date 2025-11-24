// ============================================================================
// server.ts - Express.js Backend (Refactored)
// ============================================================================

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Import routes
import ordersRoutes from './routes/orders.routes';
import migrationRoutes from './routes/migration.routes';

// Import KiotViet initialization
import { initKiotVietClient, initBranchId } from './services/kiotviet.service';

dotenv.config();

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

function printRoutes(stack: any[], prefix: string = '') {
  stack.forEach((layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`📍 Route: ${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      // This is a router middleware
      const routerPrefix = layer.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
      printRoutes(layer.handle.stack, prefix + routerPrefix);
    }
  });
}

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

async function initializeServices() {
  try {
    initKiotVietClient();
    await initBranchId();
    console.log('✅ Services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
  }
}

initializeServices();

// ============================================================================
// ROUTES REGISTRATION
// ============================================================================

app.use('/api', ordersRoutes);
app.use('/api', migrationRoutes);

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📋 Registered Routes:');
  printRoutes(app._router.stack);
});

export default app;