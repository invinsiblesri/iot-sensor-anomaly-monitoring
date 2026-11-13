/**
 * Device Management Controller
 * Handles CRUD operations for IoT sensor nodes.
 */

const { Device, SensorReading } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Retrieve all registered IoT devices with optional status and active filters
 * GET /api/devices
 */
const getAllDevices = async (req, res, next) => {
  try {
    const { status, active } = req.query;
    const filter = {};

    if (status) {
      filter.currentState = status.toUpperCase();
    }
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const devices = await Device.find(filter).sort({ deviceId: 1 }).lean();

    // Attach latest telemetry readings for quick dashboard rendering
    const deviceIds = devices.map(d => d.deviceId);
    const latestReadings = await SensorReading.aggregate([
      { $match: { deviceId: { $in: deviceIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$deviceId',
          latestReading: { $first: '$$ROOT' }
        }
      }
    ]);

    const readingMap = {};
    latestReadings.forEach(item => {
      readingMap[item._id] = item.latestReading;
    });

    const enrichedDevices = devices.map(dev => ({
      ...dev,
      latestTelemetry: readingMap[dev.deviceId] || null
    }));

    return sendSuccess(res, enrichedDevices, 200, 'Devices retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve a single device by deviceId (e.g., IOT-001) or MongoDB _id
 * GET /api/devices/:id
 */
const getDeviceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const device = await Device.findOne(
      isObjectId ? { _id: id } : { deviceId: id.toUpperCase() }
    ).lean();

    if (!device) {
      return sendError(res, `Device '${id}' not found`, 404);
    }

    const latestTelemetry = await SensorReading.findOne({ deviceId: device.deviceId })
      .sort({ timestamp: -1 })
      .lean();

    return sendSuccess(res, { ...device, latestTelemetry }, 200, 'Device retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new IoT device
 * POST /api/devices
 */
const createDevice = async (req, res, next) => {
  try {
    const { deviceId, deviceName, location, description, isActive } = req.body;

    if (!deviceId || !deviceName || !location) {
      return sendError(res, 'deviceId, deviceName, and location are required fields', 400);
    }

    // Format validation: enforce standard IOT-XXX or alphanumeric uppercase code
    const formattedId = deviceId.trim().toUpperCase();
    const existing = await Device.findOne({ deviceId: formattedId });
    if (existing) {
      return sendError(res, `Device with ID '${formattedId}' already exists`, 409);
    }

    const newDevice = await Device.create({
      deviceId: formattedId,
      deviceName: deviceName.trim(),
      location: location.trim(),
      description: (description || '').trim(),
      currentState: 'NORMAL',
      lastSeen: new Date(),
      isActive: isActive !== undefined ? isActive : true
    });

    return sendSuccess(res, newDevice, 201, 'Device registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing IoT device metadata
 * PUT /api/devices/:id
 */
const updateDevice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deviceName, location, description, isActive, currentState } = req.body;

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { deviceId: id.toUpperCase() };

    const updatePayload = {};
    if (deviceName !== undefined) updatePayload.deviceName = deviceName.trim();
    if (location !== undefined) updatePayload.location = location.trim();
    if (description !== undefined) updatePayload.description = description.trim();
    if (isActive !== undefined) updatePayload.isActive = isActive;
    if (currentState !== undefined) updatePayload.currentState = currentState;

    const updatedDevice = await Device.findOneAndUpdate(
      filter,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedDevice) {
      return sendError(res, `Device '${id}' not found`, 404);
    }

    return sendSuccess(res, updatedDevice, 200, 'Device updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an IoT device
 * Preserves historical sensor readings and state transitions for academic auditing.
 * DELETE /api/devices/:id
 */
const deleteDevice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { deviceId: id.toUpperCase() };

    const deleted = await Device.findOneAndDelete(filter);

    if (!deleted) {
      return sendError(res, `Device '${id}' not found`, 404);
    }

    return sendSuccess(
      res,
      { deletedDeviceId: deleted.deviceId, recordsPreserved: true },
      200,
      `Device '${deleted.deviceId}' decommissioned successfully. Historical records preserved.`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice
};
