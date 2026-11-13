/**
 * Alert Routes
 * /api/alerts
 */

const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  acknowledgeAlert,
  getAlertSummary
} = require('../controllers/alertController');

router.get('/', getAllAlerts);
router.get('/summary', getAlertSummary);
router.put('/:id/acknowledge', acknowledgeAlert);

module.exports = router;
