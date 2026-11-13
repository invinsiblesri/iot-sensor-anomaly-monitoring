/**
 * Central Models Aggregator
 */

const Device = require('./Device');
const SensorReading = require('./SensorReading');
const Alert = require('./Alert');
const StateTransition = require('./StateTransition');
const SystemSettings = require('./SystemSettings');

module.exports = {
  Device,
  SensorReading,
  Alert,
  StateTransition,
  SystemSettings
};
