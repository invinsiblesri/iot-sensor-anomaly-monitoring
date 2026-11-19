/**
 * Master API Router
 * Aggregates all modular REST route handlers under /api
 */

const express = require('express');
const router = express.Router();

const deviceRoutes = require('./deviceRoutes');
const sensorRoutes = require('./sensorRoutes');
const alertRoutes = require('./alertRoutes');
const stateRoutes = require('./stateRoutes');
const settingsRoutes = require('./settingsRoutes');
const networkRoutes = require('./networkRoutes');
const validatorRoutes = require('./validatorRoutes');
const automataRoutes = require('./automataRoutes');
const simulationRoutes = require('./simulationRoutes');

router.use('/devices', deviceRoutes);
router.use('/sensors', sensorRoutes);
router.use('/alerts', alertRoutes);
router.use('/states', stateRoutes);
router.use('/settings', settingsRoutes);
router.use('/network', networkRoutes);
router.use('/validator', validatorRoutes);
router.use('/automata', automataRoutes);
router.use('/simulation', simulationRoutes);

// Root /api endpoint gateway index
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IoT Sensor Data Anomaly Monitoring System REST API Gateway',
    status: 'ONLINE',
    academicYear: '2026-2027',
    endpoints: {
      health: '/api/health',
      devices: '/api/devices',
      sensors: '/api/sensors/readings',
      alerts: '/api/alerts',
      states: '/api/states',
      settings: '/api/settings',
      network: '/api/network/stats',
      validator: '/api/validator/test',
      automata: '/api/automata/definition',
      simulation: '/api/simulation/status'
    }
  });
});

module.exports = router;
