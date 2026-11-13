/**
 * Sensor Telemetry Controller
 * Handles retrieval and ingestion of IoT sensor readings.
 */

const { SensorReading, Device } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Retrieve paginated sensor readings with multi-parameter filtering
 * GET /api/sensors/readings
 */
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

/**
 * Retrieve the single most recent reading for each registered device
 * GET /api/sensors/readings/latest
 */
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

/**
 * Retrieve sensor readings for a specific device ID
 * GET /api/sensors/readings/:deviceId
 */
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
 * Manual or HTTP-based sensor reading submission endpoint
 * POST /api/sensors/readings
 */
const postReading = async (req, res, next) => {
  try {
    const { deviceId, temperature, humidity, pressure, timestamp, rawMessage } = req.body;

    if (!deviceId || temperature === undefined || humidity === undefined || pressure === undefined) {
      return sendError(res, 'deviceId, temperature, humidity, and pressure are required', 400);
    }

    const readingTime = timestamp ? new Date(timestamp) : new Date();
    const formattedRaw = rawMessage || `${deviceId}|TEMP=${temperature}|HUM=${humidity}|PRESS=${pressure}|TS=${readingTime.toISOString()}`;

    // Basic range classification (will be augmented by FLAT DFA in Phase 6)
    let stateAtReading = 'NORMAL';
    if (temperature > 40 || temperature < 5 || humidity > 80 || humidity < 15 || pressure > 1050 || pressure < 950) {
      stateAtReading = 'FAULTY';
    } else if (temperature > 30 || temperature < 18 || humidity > 60 || humidity < 30 || pressure > 1030 || pressure < 980) {
      stateAtReading = 'WARNING';
    }

    const reading = await SensorReading.create({
      deviceId: deviceId.toUpperCase(),
      temperature: Number(temperature),
      humidity: Number(humidity),
      pressure: Number(pressure),
      timestamp: readingTime,
      stateAtReading,
      rawMessage: formattedRaw,
      validationStatus: 'ACCEPTED'
    });

    // Update Device lastSeen and currentState
    await Device.findOneAndUpdate(
      { deviceId: deviceId.toUpperCase() },
      { 
        $set: { 
          lastSeen: readingTime,
          currentState: stateAtReading 
        } 
      }
    );

    return sendSuccess(res, reading, 201, 'Sensor reading recorded successfully');
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
