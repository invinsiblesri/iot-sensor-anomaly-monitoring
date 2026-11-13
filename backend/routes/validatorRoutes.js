/**
 * Validator Routes
 * /api/validator
 */

const express = require('express');
const router = express.Router();
const {
  testMessageValidation,
  getValidatorSamples
} = require('../controllers/validatorController');

router.post('/test', testMessageValidation);
router.get('/samples', getValidatorSamples);

module.exports = router;
