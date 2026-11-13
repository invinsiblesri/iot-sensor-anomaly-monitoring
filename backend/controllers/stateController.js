/**
 * State Transitions Audit Controller
 * Exposes formal DFA state changes for academic demonstration and dashboard timelines.
 */

const { StateTransition } = require('../models');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Retrieve recent state transitions across all IoT devices
 * GET /api/states
 */
const getRecentTransitions = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

    const transitions = await StateTransition.find()
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .lean();

    return sendSuccess(res, transitions, 200, 'Recent state transitions retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve state transition history for a specific device
 * GET /api/states/:deviceId
 */
const getTransitionsByDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100 } = req.query;
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));

    const transitions = await StateTransition.find({ deviceId: deviceId.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .lean();

    return sendSuccess(
      res,
      transitions,
      200,
      `State transitions for device ${deviceId.toUpperCase()} retrieved`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecentTransitions,
  getTransitionsByDevice
};
