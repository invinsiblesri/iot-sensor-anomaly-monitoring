/**
 * State Transition Routes
 * /api/states
 */

const express = require('express');
const router = express.Router();
const {
  getRecentTransitions,
  getTransitionsByDevice
} = require('../controllers/stateController');

router.get('/', getRecentTransitions);
router.get('/:deviceId', getTransitionsByDevice);

module.exports = router;
