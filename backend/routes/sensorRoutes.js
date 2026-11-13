/**
 * Sensor Routes
 * /api/sensors
 */

const express = require('express');
const router = express.Router();
const {
  getReadings,
  getLatestReadings,
  getReadingsByDeviceId,
  postReading
} = require('../controllers/sensorController');

router.route('/readings')
  .get(getReadings)
  .post(postReading);

router.get('/readings/latest', getLatestReadings);
router.get('/readings/:deviceId', getReadingsByDeviceId);

module.exports = router;
