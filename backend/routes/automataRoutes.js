/**
 * Automata Routes
 * /api/automata
 */

const express = require('express');
const router = express.Router();
const {
  getDefinition,
  simulateManualTransition,
  getTransitionHistory
} = require('../controllers/automataController');

router.get('/definition', getDefinition);
router.post('/transition', simulateManualTransition);
router.get('/history', getTransitionHistory);

module.exports = router;
