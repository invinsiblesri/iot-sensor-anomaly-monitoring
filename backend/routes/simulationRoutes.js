/**
 * Simulation Routes
 * /api/simulation
 */

const express = require('express');
const router = express.Router();
const {
  getStatus,
  startSimulation,
  stopSimulation,
  pauseSimulation,
  resumeSimulation,
  triggerDeviceAnomaly,
  disconnectDevice,
  restoreDevice
} = require('../controllers/simulationController');

router.get('/status', getStatus);
router.post('/start', startSimulation);
router.post('/stop', stopSimulation);
router.post('/pause', pauseSimulation);
router.post('/resume', resumeSimulation);

router.post('/anomaly/:deviceId', triggerDeviceAnomaly);
router.post('/disconnect/:deviceId', disconnectDevice);
router.post('/restore/:deviceId', restoreDevice);

module.exports = router;
