/**
 * System Settings Controller
 * Manages threshold limits, timeouts, and simulation parameters.
 */

const { SystemSettings } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Retrieve active system settings
 * GET /api/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    return sendSuccess(res, settings, 200, 'System settings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update system thresholds and timeouts
 * PUT /api/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const {
      temperatureThresholds,
      humidityThresholds,
      pressureThresholds,
      disconnectTimeout,
      simulationInterval
    } = req.body;

    // Validate parameters upfront before performing database queries
    if (disconnectTimeout !== undefined) {
      if (typeof disconnectTimeout !== 'number' || disconnectTimeout < 5 || disconnectTimeout > 300) {
        return sendError(res, 'disconnectTimeout must be a number between 5 and 300 seconds', 400);
      }
    }

    if (simulationInterval !== undefined) {
      if (typeof simulationInterval !== 'number' || simulationInterval < 1 || simulationInterval > 60) {
        return sendError(res, 'simulationInterval must be a number between 1 and 60 seconds', 400);
      }
    }

    const settings = await SystemSettings.getSettings();

    if (temperatureThresholds) {
      settings.temperatureThresholds = {
        ...settings.temperatureThresholds.toObject(),
        ...temperatureThresholds
      };
    }

    if (humidityThresholds) {
      settings.humidityThresholds = {
        ...settings.humidityThresholds.toObject(),
        ...humidityThresholds
      };
    }

    if (pressureThresholds) {
      settings.pressureThresholds = {
        ...settings.pressureThresholds.toObject(),
        ...pressureThresholds
      };
    }

    if (disconnectTimeout !== undefined) {
      settings.disconnectTimeout = disconnectTimeout;
    }

    if (simulationInterval !== undefined) {
      settings.simulationInterval = simulationInterval;
    }

    settings.updatedAt = new Date();
    await settings.save();

    return sendSuccess(res, settings, 200, 'System settings updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
