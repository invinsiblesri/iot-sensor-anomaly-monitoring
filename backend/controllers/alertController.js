/**
 * Anomaly Alerts Controller
 * Handles retrieval, summary statistics, and lifecycle acknowledgements of alerts.
 */

const { Alert } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Retrieve alerts with filtering and pagination
 * GET /api/alerts
 */
const getAllAlerts = async (req, res, next) => {
  try {
    const {
      deviceId,
      severity,
      alertType,
      acknowledged,
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
    if (severity) {
      filter.severity = severity.toUpperCase();
    }
    if (alertType) {
      filter.alertType = alertType.toUpperCase();
    }
    if (acknowledged !== undefined) {
      filter.acknowledged = acknowledged === 'true';
    }

    const [alerts, totalCount] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Alert.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return sendSuccess(res, alerts, 200, 'Alerts retrieved successfully', {
      totalRecords: totalCount,
      totalPages,
      currentPage: pageNum,
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Acknowledge an active anomaly alert
 * PUT /api/alerts/:id/acknowledge
 */
const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      {
        $set: {
          acknowledged: true,
          acknowledgedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedAlert) {
      return sendError(res, `Alert with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, updatedAlert, 200, 'Alert acknowledged successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve alert statistics summary for dashboard KPI badges
 * GET /api/alerts/summary
 */
const getAlertSummary = async (req, res, next) => {
  try {
    const [unacknowledgedCount, severityBreakdown] = await Promise.all([
      Alert.countDocuments({ acknowledged: false }),
      Alert.aggregate([
        { $match: { acknowledged: false } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
    ]);

    const breakdown = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };

    severityBreakdown.forEach(item => {
      if (breakdown[item._id] !== undefined) {
        breakdown[item._id] = item.count;
      }
    });

    return sendSuccess(
      res,
      {
        unacknowledgedTotal: unacknowledgedCount,
        severityBreakdown: breakdown
      },
      200,
      'Alert summary retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlerts,
  acknowledgeAlert,
  getAlertSummary
};
