/**
 * Event-Driven Architecture: Central Application Event Bus
 * Uses native Node.js EventEmitter to publish and subscribe to IoT operational events.
 */

const EventEmitter = require('events');

class IoTEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow ample listeners for telemetry subscribers, alert loggers, and analytics
    this.setMaxListeners(30);
  }

  // Standard Event Types
  static EVENTS = {
    SENSOR_RECEIVED: 'sensorReceived',
    SENSOR_VALIDATED: 'sensorValidated',
    ANOMALY_DETECTED: 'anomalyDetected',
    DEVICE_STATE_CHANGED: 'deviceStateChanged',
    DEVICE_DISCONNECTED: 'deviceDisconnected'
  };
}

const eventBus = new IoTEventBus();

module.exports = {
  eventBus,
  EVENTS: IoTEventBus.EVENTS
};
