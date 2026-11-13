/**
 * IoT Sensor Simulation Engine
 * Generates synthetic telemetry for IOT-001 through IOT-005, manages disconnection watchdogs,
 * and provides interactive anomaly injection controls.
 */

const { processSensorMessage } = require('../services/sensorProcessingService');
const DeviceDFA = require('../automata/dfa');
const { Device, StateTransition, Alert, SystemSettings } = require('../models');
const { eventBus, EVENTS } = require('../services/eventBus');

class SensorSimulator {
  constructor() {
    this.devices = ['IOT-001', 'IOT-002', 'IOT-003', 'IOT-004', 'IOT-005'];
    this.intervalTimer = null;
    this.watchdogTimer = null;
    this.isRunning = false;
    this.isPaused = false;
    this.simulationIntervalMs = 3000;
    this.disconnectTimeoutSec = 15;

    // Device telemetry baselines for natural random walks
    this.deviceStates = {
      'IOT-001': { temp: 24.0, hum: 45.0, press: 1013.0, isDisconnected: false, forcedAnomaly: null },
      'IOT-002': { temp: 21.5, hum: 52.0, press: 1008.5, isDisconnected: false, forcedAnomaly: null },
      'IOT-003': { temp: 26.0, hum: 38.0, press: 1015.0, isDisconnected: false, forcedAnomaly: null },
      'IOT-004': { temp: 19.5, hum: 58.0, press: 1011.0, isDisconnected: false, forcedAnomaly: null },
      'IOT-005': { temp: 25.0, hum: 42.0, press: 1005.0, isDisconnected: false, forcedAnomaly: null }
    };
  }

  /**
   * Start the simulation cycle and disconnection watchdog
   */
  start() {
    if (this.isRunning) return this.getStatus();

    this.isRunning = true;
    this.isPaused = false;

    // Simulation tick loop
    this.intervalTimer = setInterval(() => {
      if (!this.isPaused) {
        this.generateTick();
      }
    }, this.simulationIntervalMs);

    // Watchdog loop running every 3 seconds to catch timeouts
    this.watchdogTimer = setInterval(() => {
      this.checkWatchdogDisconnections();
    }, 3000);

    console.log('[SIMULATOR] Simulation engine started. Interval: ' + this.simulationIntervalMs + 'ms');
    return this.getStatus();
  }

  /**
   * Stop the simulation engine
   */
  stop() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    if (this.watchdogTimer) clearInterval(this.watchdogTimer);
    this.intervalTimer = null;
    this.watchdogTimer = null;
    this.isRunning = false;
    this.isPaused = false;

    console.log('[SIMULATOR] Simulation engine stopped.');
    return this.getStatus();
  }

  /**
   * Pause telemetry generation
   */
  pause() {
    if (!this.isRunning) return this.getStatus();
    this.isPaused = true;
    console.log('[SIMULATOR] Simulation paused.');
    return this.getStatus();
  }

  /**
   * Resume telemetry generation
   */
  resume() {
    if (!this.isRunning) return this.start();
    this.isPaused = false;
    console.log('[SIMULATOR] Simulation resumed.');
    return this.getStatus();
  }

  /**
   * Single tick generating readings for all active devices
   */
  async generateTick() {
    for (const deviceId of this.devices) {
      const state = this.deviceStates[deviceId];
      if (!state || state.isDisconnected) {
        // Skip disconnected devices to let watchdog detect silence
        continue;
      }

      let { temp, hum, press } = this.computeNextReading(deviceId);

      // Check for forced one-shot or sustained anomaly
      if (state.forcedAnomaly) {
        if (state.forcedAnomaly === 'WARNING') {
          temp = 34.5; // Warning range
          hum = 68.0;
        } else if (state.forcedAnomaly === 'FAULTY') {
          temp = 46.8; // Critical Faulty range
          hum = 88.5;
          press = 1065.0;
        }
        state.forcedAnomaly = null; // Clear one-shot override
      }

      // Format ISO 8601 UTC timestamp
      const timestamp = new Date().toISOString();

      // Format wire protocol frame
      const frame = `${deviceId}|TEMP=${temp}|HUM=${hum}|PRESS=${press}|TS=${timestamp}`;

      try {
        await processSensorMessage(frame);
      } catch (err) {
        console.error(`[SIMULATOR ERROR] Failed processing frame for ${deviceId}:`, err.message);
      }
    }
  }

  /**
   * Compute natural slight random fluctuation for sensor telemetry
   */
  computeNextReading(deviceId) {
    const s = this.deviceStates[deviceId];

    // Smooth random walk with bounded mean reversion
    const deltaTemp = (Math.random() - 0.49) * 0.8;
    const deltaHum = (Math.random() - 0.49) * 1.5;
    const deltaPress = (Math.random() - 0.49) * 0.5;

    s.temp = Math.max(12, Math.min(38, s.temp + deltaTemp));
    s.hum = Math.max(25, Math.min(75, s.hum + deltaHum));
    s.press = Math.max(970, Math.min(1040, s.press + deltaPress));

    return {
      temp: Number(s.temp.toFixed(1)),
      hum: Number(s.hum.toFixed(1)),
      press: Number(s.press.toFixed(1))
    };
  }

  /**
   * Watchdog timer inspecting devices for disconnection timeout
   */
  async checkWatchdogDisconnections() {
    try {
      const now = Date.now();
      const cutoffTime = new Date(now - this.disconnectTimeoutSec * 1000);

      // Find active devices whose lastSeen is older than cutoff and not already DISCONNECTED
      const timedOutDevices = await Device.find({
        isActive: true,
        lastSeen: { $lt: cutoffTime },
        currentState: { $ne: 'DISCONNECTED' }
      });

      for (const dev of timedOutDevices) {
        const previousState = dev.currentState;
        // Execute DFA transition with symbol 'd' (Timeout)
        const transition = DeviceDFA.transition(previousState, 'd');
        const nextState = transition.nextState; // DISCONNECTED

        dev.currentState = nextState;
        await dev.save();

        // Record State Transition
        await StateTransition.create({
          deviceId: dev.deviceId,
          previousState,
          inputSymbol: 'd',
          nextState,
          timestamp: new Date()
        });

        // Trigger Disconnection Alert
        await Alert.create({
          deviceId: dev.deviceId,
          alertType: 'DISCONNECTED',
          severity: 'HIGH',
          message: `Device '${dev.deviceId}' heartbeat timeout. No transmission for >${this.disconnectTimeoutSec} seconds.`,
          sensorValues: { temperature: null, humidity: null, pressure: null },
          acknowledged: false,
          createdAt: new Date()
        });

        eventBus.emit(EVENTS.DEVICE_DISCONNECTED, {
          deviceId: dev.deviceId,
          timeoutSeconds: this.disconnectTimeoutSec,
          timestamp: new Date()
        });

        console.log(`[SIMULATOR WATCHDOG] ${dev.deviceId} classified as DISCONNECTED (Symbol 'd')`);
      }
    } catch (err) {
      // Non-blocking database check
    }
  }

  /**
   * Inject anomaly condition into a specific device
   */
  triggerAnomaly(deviceId, anomalyType = 'WARNING') {
    const formattedId = deviceId.toUpperCase();
    if (this.deviceStates[formattedId]) {
      this.deviceStates[formattedId].forcedAnomaly = anomalyType.toUpperCase();
      this.deviceStates[formattedId].isDisconnected = false;
      return { success: true, message: `Injected ${anomalyType} condition on ${formattedId}` };
    }
    return { success: false, message: `Device ${deviceId} not found in simulator fleet` };
  }

  /**
   * Disconnect a device (stop its transmission so watchdog triggers DISCONNECTED)
   */
  disconnectDevice(deviceId) {
    const formattedId = deviceId.toUpperCase();
    if (this.deviceStates[formattedId]) {
      this.deviceStates[formattedId].isDisconnected = true;
      return { success: true, message: `Device ${formattedId} transmission halted. Watchdog will mark DISCONNECTED after ${this.disconnectTimeoutSec}s.` };
    }
    return { success: false, message: `Device ${deviceId} not found` };
  }

  /**
   * Restore a disconnected device
   */
  restoreDevice(deviceId) {
    const formattedId = deviceId.toUpperCase();
    if (this.deviceStates[formattedId]) {
      this.deviceStates[formattedId].isDisconnected = false;
      this.deviceStates[formattedId].temp = 23.5;
      this.deviceStates[formattedId].hum = 45.0;
      this.deviceStates[formattedId].press = 1013.2;
      return { success: true, message: `Device ${formattedId} restored to active transmission.` };
    }
    return { success: false, message: `Device ${deviceId} not found` };
  }

  /**
   * Current simulation runtime status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      simulationIntervalMs: this.simulationIntervalMs,
      disconnectTimeoutSec: this.disconnectTimeoutSec,
      managedDevices: this.devices,
      deviceStates: this.deviceStates
    };
  }
}

// Singleton instance across application
const simulator = new SensorSimulator();

module.exports = simulator;
