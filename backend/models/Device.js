/**
 * Device Model Schema
 * Represents registered IoT physical or simulated telemetry nodes.
 */

const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required (e.g., IOT-001)'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    deviceName: {
      type: String,
      required: [true, 'Device Name is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Physical or operational location is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    currentState: {
      type: String,
      enum: {
        values: ['NORMAL', 'WARNING', 'FAULTY', 'DISCONNECTED'],
        message: '{VALUE} is not a valid operational state'
      },
      default: 'NORMAL',
      index: true
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Device', deviceSchema);
