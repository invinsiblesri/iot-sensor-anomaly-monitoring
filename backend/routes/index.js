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

module.exports = router;
