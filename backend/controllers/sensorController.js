/**
 * Sensor Telemetry Controller
 * Handles retrieval and ingestion of IoT sensor readings.
 */

const { SensorReading, Device } = require('../models');
const { processSensorMessage } = require('../services/sensorProcessingService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getReadings = async (req, res, next) => {
  try {
    const {
      deviceId,
      state,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (deviceId) {
      filter.deviceId = deviceId.toUpperCase();
    }

    if (state) {
      filter.stateAtReading = state.toUpperCase();
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    const [readings, totalCount] = await Promise.all([
      SensorReading.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SensorReading.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return sendSuccess(
      res,
      readings,
      200,
      'Sensor readings retrieved successfully',
      {
        totalRecords: totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    );
  } catch (error) {
    next(error);
  }
};

const getLatestReadings = async (req, res, next) => {
  try {
    const latestReadings = await SensorReading.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$deviceId',
          reading: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$reading' } },
      { $sort: { deviceId: 1 } }
    ]);

    return sendSuccess(res, latestReadings, 200, 'Latest sensor readings retrieved');
  } catch (error) {
    next(error);
  }
};

const getReadingsByDeviceId = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100 } = req.query;
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));

    const readings = await SensorReading.find({ deviceId: deviceId.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .lean();

    return sendSuccess(
      res,
      readings,
      200,
      `Telemetry history for ${deviceId.toUpperCase()} retrieved`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Sensor reading ingestion endpoint
 * Validates wire format via FLAT Regex and executes DFA transition
 * POST /api/sensors/readings
 */
const postReading = async (req, res, next) => {
  try {
    let rawFrame = req.body.rawMessage;

    if (!rawFrame) {
      const { deviceId, temperature, humidity, pressure, timestamp } = req.body;
      if (!deviceId || temperature === undefined || humidity === undefined || pressure === undefined) {
        return sendError(res, 'Must provide either rawMessage string or deviceId, temperature, humidity, and pressure', 400);
      }
      const ts = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
      rawFrame = `${deviceId.toUpperCase()}|TEMP=${temperature}|HUM=${humidity}|PRESS=${pressure}|TS=${ts}`;
    }

    const result = await processSensorMessage(rawFrame);

    if (!result.success) {
      return sendError(
        res,
        `Sensor message rejected by formal grammar: ${result.errorReason}`,
        400,
        { validationStatus: 'REJECTED', rawMessage: rawFrame, reason: result.errorReason }
      );
    }

    return sendSuccess(res, result, 201, 'Sensor reading accepted and processed by DFA');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReadings,
  getLatestReadings,
  getReadingsByDeviceId,
  postReading
};
