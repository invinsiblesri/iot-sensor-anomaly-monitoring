/**
 * SensorReading Model Schema
 * Represents validated time-series telemetry records received from IoT nodes.
 */

const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID reference is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature reading is required in degrees Celsius']
    },
    humidity: {
      type: Number,
      required: [true, 'Humidity reading is required in percentage']
    },
    pressure: {
      type: Number,
      required: [true, 'Atmospheric pressure is required in hPa']
    },
    timestamp: {
      type: Date,
      required: [true, 'Sensor reading timestamp is required'],
      index: true
    },
    stateAtReading: {
      type: String,
      enum: {
        values: ['NORMAL', 'WARNING', 'FAULTY', 'DISCONNECTED'],
        message: '{VALUE} is not a valid state at reading'
      },
      required: [true, 'State classified at reading is required']
    },
    rawMessage: {
      type: String,
      required: [true, 'Raw protocol frame wire string is required']
    },
    validationStatus: {
      type: String,
      enum: ['ACCEPTED', 'REJECTED'],
      default: 'ACCEPTED'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient time-series querying per device
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
