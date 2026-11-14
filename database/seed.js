/**
 * Database Seed Script
 * Provisions initial simulated IoT devices (IOT-001 through IOT-005) and baseline system thresholds.
 */

const path = require('path');
const backendModules = path.join(__dirname, '../backend/node_modules');
require(path.join(backendModules, 'dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
const mongoose = require(path.join(backendModules, 'mongoose'));
const { Device, SystemSettings, SensorReading, Alert, StateTransition } = require('../backend/models');

const initialDevices = [
  {
    deviceId: 'IOT-001',
    deviceName: 'Main Server Room Sensor',
    location: 'Data Center Rack A1',
    description: 'Monitors ambient thermal and humidity levels in primary compute cluster',
    currentState: 'NORMAL',
    isActive: true
  },
  {
    deviceId: 'IOT-002',
    deviceName: 'Cooling Unit Sensor',
    location: 'HVAC Intake Plenum',
    description: 'Monitors cooling air supply and barometric pressure differential',
    currentState: 'NORMAL',
    isActive: true
  },
  {
    deviceId: 'IOT-003',
    deviceName: 'Production Floor Sensor',
    location: 'Fabrication Bay 1',
    description: 'Monitors cleanroom ambient atmospheric standards',
    currentState: 'NORMAL',
    isActive: true
  },
  {
    deviceId: 'IOT-004',
    deviceName: 'Warehouse Storage Monitor',
    location: 'Logistics Vault B',
    description: 'Monitors environmental moisture-sensitive inventory zone',
    currentState: 'NORMAL',
    isActive: true
  },
  {
    deviceId: 'IOT-005',
    deviceName: 'Backup Generator Sensor',
    location: 'Power Substation Unit 3',
    description: 'Monitors emergency power generation room temperature and air pressure',
    currentState: 'NORMAL',
    isActive: true
  }
];

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('ERROR: MONGODB_URI is not defined in backend/.env');
    process.exit(1);
  }

  try {
    console.log('[SEED] Connecting to MongoDB...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[SEED] Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);

    // Seed or Upsert System Settings
    console.log('[SEED] Checking System Settings...');
    const existingSettings = await SystemSettings.findOne();
    if (!existingSettings) {
      await SystemSettings.create({
        temperatureThresholds: { normalMin: 18, normalMax: 30, warningMin: 5, warningMax: 40 },
        humidityThresholds: { normalMin: 30, normalMax: 60, warningMin: 15, warningMax: 80 },
        pressureThresholds: { normalMin: 980, normalMax: 1030, warningMin: 950, warningMax: 1050 },
        disconnectTimeout: 15,
        simulationInterval: 3
      });
      console.log('[SEED] Created baseline SystemSettings document.');
    } else {
      console.log('[SEED] SystemSettings document already present.');
    }

    // Seed or Upsert Devices
    console.log('[SEED] Upserting initial IoT devices (IOT-001 to IOT-005)...');
    for (const dev of initialDevices) {
      const updated = await Device.findOneAndUpdate(
        { deviceId: dev.deviceId },
        { 
          $set: {
            deviceName: dev.deviceName,
            location: dev.location,
            description: dev.description,
            isActive: dev.isActive
          },
          $setOnInsert: {
            currentState: dev.currentState,
            lastSeen: new Date()
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[SEED] Device provisioned: ${updated.deviceId} - ${updated.deviceName} (${updated.location})`);
    }

    console.log('====================================================');
    console.log('>>> DATABASE SEEDING COMPLETED SUCCESSFULLY <<<');
    console.log('====================================================');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[SEED ERROR] Seeding failed:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();
