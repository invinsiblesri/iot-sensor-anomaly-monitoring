/**
 * Alert Model Schema
 * Represents actionable anomaly alerts triggered when devices transition to abnormal states.
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID reference is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    alertType: {
      type: String,
      enum: {
        values: ['WARNING', 'FAULTY', 'DISCONNECTED'],
        message: '{VALUE} is not a valid alert type'
      },
      required: [true, 'Alert type is required']
    },
    severity: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        message: '{VALUE} is not a valid severity level'
      },
      required: [true, 'Severity level is required']
    },
    message: {
      type: String,
      required: [true, 'Human-readable alert message is required'],
      trim: true
    },
    sensorValues: {
      temperature: { type: Number, default: null },
      humidity: { type: Number, default: null },
      pressure: { type: Number, default: null }
    },
    acknowledged: {
      type: Boolean,
      default: false,
      index: true
    },
    acknowledgedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying unacknowledged alerts by device or creation time
alertSchema.index({ acknowledged: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
