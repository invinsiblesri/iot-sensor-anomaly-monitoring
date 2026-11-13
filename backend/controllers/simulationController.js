/**
 * Simulation Control Controller
 * Provides interactive endpoints for controlling the IoT telemetry generator.
 */

const simulator = require('../simulation/sensorSimulator');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getStatus = (req, res) => {
  return sendSuccess(res, simulator.getStatus(), 200, 'Simulator status retrieved');
};

const startSimulation = (req, res) => {
  const status = simulator.start();
  return sendSuccess(res, status, 200, 'IoT Sensor Simulation started');
};

const stopSimulation = (req, res) => {
  const status = simulator.stop();
  return sendSuccess(res, status, 200, 'IoT Sensor Simulation stopped');
};

const pauseSimulation = (req, res) => {
  const status = simulator.pause();
  return sendSuccess(res, status, 200, 'IoT Sensor Simulation paused');
};

const resumeSimulation = (req, res) => {
  const status = simulator.resume();
  return sendSuccess(res, status, 200, 'IoT Sensor Simulation resumed');
};

const triggerDeviceAnomaly = (req, res) => {
  const { deviceId } = req.params;
  const { type = 'FAULTY' } = req.body;

  const result = simulator.triggerAnomaly(deviceId, type);
  if (!result.success) {
    return sendError(res, result.message, 404);
  }
  return sendSuccess(res, simulator.getStatus(), 200, result.message);
};

const disconnectDevice = (req, res) => {
  const { deviceId } = req.params;
  const result = simulator.disconnectDevice(deviceId);
  if (!result.success) {
    return sendError(res, result.message, 404);
  }
  return sendSuccess(res, simulator.getStatus(), 200, result.message);
};

const restoreDevice = (req, res) => {
  const { deviceId } = req.params;
  const result = simulator.restoreDevice(deviceId);
  if (!result.success) {
    return sendError(res, result.message, 404);
  }
  return sendSuccess(res, simulator.getStatus(), 200, result.message);
};

module.exports = {
  getStatus,
  startSimulation,
  stopSimulation,
  pauseSimulation,
  resumeSimulation,
  triggerDeviceAnomaly,
  disconnectDevice,
  restoreDevice
};
