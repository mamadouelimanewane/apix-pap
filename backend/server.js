/**
 * APIX-PAP Backend Server v2
 * Multi-Project Architecture for TER + Future Projects
 *
 * Running: npm start
 * Health: GET /health
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();

// ============================================================================
// MONGODB CONNECTION
// ============================================================================

console.log('🔌 Initializing MongoDB connection...');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apix_pap';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log('✅ MongoDB Connected');
  console.log(`   Database: ${MONGODB_URI.split('/').pop().split('?')[0]}`);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('   Make sure MongoDB URI is correct in .env or Render settings');
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB Disconnected - reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB Reconnected');
});

// ============================================================================
// MODELS
// ============================================================================

const { Project, CategorySchema, Beneficiary, ImportBatch } = require('./models');

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// File Upload
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  safeFileNames: true,
  preserveExtension: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// JSON Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// AUTH MIDDLEWARE (Placeholder - Adapt to your auth system)
// ============================================================================

const authMiddleware = (req, res, next) => {
  // For development: allow all requests
  if (process.env.NODE_ENV !== 'production') {
    req.user = { _id: 'dev-user', role: 'admin' };
    return next();
  }

  // For production: check JWT token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // TODO: Verify JWT token here
  req.user = { _id: 'user-id', role: 'admin' };
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    service: 'APIX-PAP Backend v2',
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime() / 60) + ' minutes'
  });
});

// Import Routes
const importRoutes = require('./routes/import');
app.use('/api/projects', authMiddleware, importRoutes);

// Info Routes
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    name: 'APIX-PAP Backend v2',
    version: '2.0.0',
    endpoints: {
      health: 'GET /health',
      detectSchema: 'POST /api/projects/:projectId/detect-schema',
      import: 'POST /api/projects/:projectId/import',
      importBatches: 'GET /api/import-batches',
      importBatchDetail: 'GET /api/import-batches/:batchId'
    },
    features: [
      'Multi-Project Architecture',
      'Auto-detect Categories',
      'Bulk Import with Mapping',
      'Audit Trail Tracking',
      'Geospatial Support (UTM)',
      'Soft-delete & Recovery'
    ]
  });
});

// ============================================================================
// 404 HANDLER
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /health',
      'GET /api/info',
      'POST /api/projects/:projectId/detect-schema',
      'POST /api/projects/:projectId/import',
      'GET /api/import-batches'
    ]
  });
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ APIX-PAP Backend v2 is running!');
  console.log('='.repeat(60));
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`🏥 Health:  http://${HOST}:${PORT}/health`);
  console.log(`📊 Info:    http://${HOST}:${PORT}/api/info`);
  console.log(`🌍 CORS:    ${process.env.CORS_ORIGIN || 'All origins'}`);
  console.log(`📦 Env:     ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60) + '\n');
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('🛑 Server closed');
    mongoose.connection.close(() => {
      console.log('🔌 MongoDB disconnected');
      process.exit(0);
    });
  });
});

module.exports = app;
