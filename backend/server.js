/**
 * IoT Sensor Data Anomaly Monitoring System - Express Server
 * Academic Year 2026-2027 | Department Comprehensive Assessment Project
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDBStatus } = require('./config/db');
const { networkTracker } = require('./middleware/networkTracker');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB
connectDB();

// CORS Middleware Configuration
// origin: true dynamically reflects the requesting origin (Vercel, localhost, etc.)
// ensuring seamless communication across all client deployments
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Computer Networks Diagnostic Tracker Middleware
app.use(networkTracker);

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

// Mount Central API REST Routes
app.use('/api', apiRoutes);

// Root Gateway Info Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'IoT Sensor Data Anomaly Monitoring System API Gateway',
    documentation: '/api/docs',
    healthCheck: '/api/health',
    endpoints: {
      devices: '/api/devices',
      sensors: '/api/sensors/readings',
      alerts: '/api/alerts',
      states: '/api/states',
      settings: '/api/settings',
      network: '/api/network/stats'
    }
  });
});

// Central 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: `Endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`
  });
});

// Central Error Handler Middleware
app.use(errorHandler);

// Start Server Listener
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
