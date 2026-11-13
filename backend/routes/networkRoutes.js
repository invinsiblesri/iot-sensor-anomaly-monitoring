/**
 * Network Telemetry Routes
 * /api/network
 */

const express = require('express');
const router = express.Router();
const { getNetworkStats } = require('../controllers/networkController');

router.get('/stats', getNetworkStats);

module.exports = router;
