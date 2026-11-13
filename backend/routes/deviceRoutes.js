/**
 * Device Routes
 * /api/devices
 */

const express = require('express');
const router = express.Router();
const {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice
} = require('../controllers/deviceController');

router.route('/')
  .get(getAllDevices)
  .post(createDevice);

router.route('/:id')
  .get(getDeviceById)
  .put(updateDevice)
  .delete(deleteDevice);

module.exports = router;
