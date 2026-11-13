/**
 * Sensor Processing Service
 * Orchestrates wire parsing, Regex validation, DFA classification, Mongoose persistence,
 * and event dispatching.
 */

const { validateSensorMessage } = require('../validators/sensorRegex');
const { classifyReadingAlphabet } = require('../automata/alphabet');
const DeviceDFA = require('../automata/dfa');
const { Device, SensorReading, Alert, StateTransition, SystemSettings } = require('../models');
const { eventBus, EVENTS } = require('./eventBus');

// In-memory fallback settings in case of initial database sync
const defaultThresholds = {
  temperatureThresholds: { normalMin: 18, normalMax: 30, warningMin: 5, warningMax: 40 },
  humidityThresholds: { normalMin: 30, normalMax: 60, warningMin: 15, warningMax: 80 },
  pressureThresholds: { normalMin: 980, normalMax: 1030, warningMin: 950, warningMax: 1050 },
  disconnectTimeout: 15,
  simulationInterval: 3
};

/**
 * Process raw sensor wire frame string
 * @param {string} rawMessage - e.g. "IOT-001|TEMP=25.4|HUM=45|PRESS=1013.2|TS=2026-11-13T10:30:00Z"
 * @returns {Object} Processing outcome with classification and DFA transition
 */
const processSensorMessage = async (rawMessage) => {
  eventBus.emit(EVENTS.SENSOR_RECEIVED, { rawMessage, timestamp: new Date() });

  // 1. FLAT Syntax Validation using Regular Expression
  const validation = validateSensorMessage(rawMessage);

  if (!validation.isValid) {
    return {
      success: false,
      validationStatus: 'REJECTED',
      errorReason: validation.errorReason,
      rawMessage
    };
  }

  const { deviceId, temperature, humidity, pressure, timestamp } = validation.parsedData;
  eventBus.emit(EVENTS.SENSOR_VALIDATED, { deviceId, parsedData: validation.parsedData });

  // 2. Fetch System Threshold Settings
  let settings;
  try {
    settings = await SystemSettings.getSettings();
  } catch (err) {
    settings = defaultThresholds;
  }

  // 3. FLAT Alphabet Evaluation: Map telemetry metrics to Sigma = { a, b, c, d }
  const classification = classifyReadingAlphabet(
    { temperature, humidity, pressure },
    settings
  );

  // 4. Retrieve or register Device
  let device = null;
  try {
    device = await Device.findOne({ deviceId });
    if (!device) {
      device = await Device.create({
        deviceId,
        deviceName: `Simulated Sensor ${deviceId}`,
        location: 'Monitored Facility Zone',
        currentState: 'NORMAL',
        lastSeen: timestamp
      });
    }
  } catch (err) {
    console.error(`[DB WARNING] Failed to lookup/create device ${deviceId}:`, err.message);
  }

  const currentState = device ? device.currentState : 'NORMAL';

  // 5. FLAT DFA Transition Execution: delta(currentState, symbol) -> nextState
  const transitionResult = DeviceDFA.transition(currentState, classification.symbol);
  const nextState = transitionResult.nextState;

  // 6. Persist Telemetry Reading
  let readingRecord = null;
  try {
    readingRecord = await SensorReading.create({
      deviceId,
      temperature,
      humidity,
      pressure,
      timestamp,
      stateAtReading: nextState,
      rawMessage,
      validationStatus: 'ACCEPTED'
    });
  } catch (err) {
    console.error(`[DB ERROR] Failed to save SensorReading:`, err.message);
  }

  // 7. Handle State Transition & Audit Trail
  if (transitionResult.isStateChanged || currentState === 'DISCONNECTED') {
    try {
      await StateTransition.create({
        deviceId,
        previousState: currentState,
        inputSymbol: classification.symbol,
        nextState,
        timestamp
      });

      if (device) {
        device.currentState = nextState;
        device.lastSeen = timestamp;
        await device.save();
      }

      eventBus.emit(EVENTS.DEVICE_STATE_CHANGED, {
        deviceId,
        previousState: currentState,
        inputSymbol: classification.symbol,
        nextState,
        timestamp
      });
    } catch (err) {
      console.error(`[DB ERROR] Failed to record StateTransition:`, err.message);
    }
  } else if (device) {
    // State unchanged; update lastSeen
    try {
      device.lastSeen = timestamp;
      await device.save();
    } catch (err) {
      // Ignored non-critical update failure
    }
  }

  // 8. Anomaly Alert Generation (with deduplication)
  if (nextState === 'WARNING' || nextState === 'FAULTY') {
    eventBus.emit(EVENTS.ANOMALY_DETECTED, {
      deviceId,
      state: nextState,
      classification,
      metrics: { temperature, humidity, pressure },
      timestamp
    });

    // Deduplication rule: Only create new Alert record when entering anomalous state
    // or when previous alert was already acknowledged
    if (transitionResult.isStateChanged) {
      try {
        await Alert.create({
          deviceId,
          alertType: nextState,
          severity: classification.severity,
          message: classification.description,
          sensorValues: { temperature, humidity, pressure },
          acknowledged: false,
          createdAt: timestamp
        });
      } catch (err) {
        console.error(`[DB ERROR] Failed to save Alert:`, err.message);
      }
    }
  }

  return {
    success: true,
    validationStatus: 'ACCEPTED',
    reading: readingRecord,
    classification,
    transition: transitionResult,
    currentState: nextState
  };
};

module.exports = {
  processSensorMessage
};
