/**
 * IoT Sensor Data Anomaly Monitoring System - Express Server
 * Academic Year 2026-2027 | Department Comprehensive Assessment Project
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDBStatus } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB
connectDB();

// Middleware Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy violation: Origin not allowed'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware (CN Diagnostic Tracker)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> Status ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Real-Time Health & Diagnostic Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  const isHealthy = dbStatus.isConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ONLINE' : 'DEGRADED',
    service: 'IoT Sensor Data Anomaly Monitoring Backend',
    academicYear: '2026-2027',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    systemEnvironment: {
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'development'
    }
  });
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'IoT Sensor Data Anomaly Monitoring System API Gateway',
    documentation: '/api/docs',
    healthCheck: '/api/health'
  });
});

// Central 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist on this server.`,
    statusCode: 404
  });
});

// Central Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.',
    statusCode: err.status || 500
  });
});

// Start Server Listener (only when executed directly, not when imported by test harnesses)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`IoT Sensor Monitoring Backend running on PORT: ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
