/**
 * SystemSettings Model Schema
 * Persists operational threshold configurations, disconnection timeouts, and simulation intervals.
 * Uses a singleton pattern where one configuration document governs the monitoring runtime.
 */

const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    temperatureThresholds: {
      normalMin: { type: Number, default: 18.0 },
      normalMax: { type: Number, default: 30.0 },
      warningMin: { type: Number, default: 5.0 },
      warningMax: { type: Number, default: 40.0 }
    },
    humidityThresholds: {
      normalMin: { type: Number, default: 30.0 },
      normalMax: { type: Number, default: 60.0 },
      warningMin: { type: Number, default: 15.0 },
      warningMax: { type: Number, default: 80.0 }
    },
    pressureThresholds: {
      normalMin: { type: Number, default: 980.0 },
      normalMax: { type: Number, default: 1030.0 },
      warningMin: { type: Number, default: 950.0 },
      warningMax: { type: Number, default: 1050.0 }
    },
    disconnectTimeout: {
      type: Number,
      default: 15, // seconds without a reading before marking DISCONNECTED
      min: [5, 'Disconnect timeout must be at least 5 seconds'],
      max: [300, 'Disconnect timeout cannot exceed 300 seconds']
    },
    simulationInterval: {
      type: Number,
      default: 3, // seconds between simulation ticks
      min: [1, 'Simulation interval must be at least 1 second'],
      max: [60, 'Simulation interval cannot exceed 60 seconds']
    }
  },
  {
    timestamps: true
  }
);

/**
 * Static method to retrieve the single active settings document or create default settings if none exist
 */
systemSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
    console.log('[SETTINGS] Initialized default system threshold configuration.');
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
