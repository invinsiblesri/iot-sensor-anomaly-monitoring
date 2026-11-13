/**
 * Formal Languages & Automata Theory (FLAT): Regular Expression Syntax Validator
 * 
 * Formal Language Definition:
 * L = { w in Sigma* | w matches the IoT protocol grammar }
 * 
 * Wire Grammar:
 * <DEVICE_ID>|TEMP=<FLOAT>|HUM=<FLOAT>|PRESS=<FLOAT>|TS=<ISO8601_UTC>
 */

// Full-string deterministic regular expression (Chomsky Hierarchy Level 3)
const SENSOR_FRAME_REGEX = /^IOT-\d{3}\|TEMP=-?\d+(\.\d+)?\|HUM=\d+(\.\d+)?\|PRESS=\d+(\.\d+)?\|TS=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/**
 * Validates raw wire message string against formal regular grammar
 * @param {string} rawMessage - Incoming message string from IoT device
 * @returns {Object} Validation outcome with parsed tokens or rejection diagnosis
 */
const validateSensorMessage = (rawMessage) => {
  if (typeof rawMessage !== 'string') {
    return {
      isValid: false,
      status: 'REJECTED',
      errorReason: 'Input payload must be a non-empty string',
      parsedData: null,
      rawMessage: String(rawMessage || '')
    };
  }

  const trimmedMessage = rawMessage.trim();

  // Test complete string against the formal Regular Expression
  const matches = SENSOR_FRAME_REGEX.test(trimmedMessage);

  if (matches) {
    // Syntactically accepted: Extract token values
    const parts = trimmedMessage.split('|');
    const deviceId = parts[0];
    const temperature = parseFloat(parts[1].replace('TEMP=', ''));
    const humidity = parseFloat(parts[2].replace('HUM=', ''));
    const pressure = parseFloat(parts[3].replace('PRESS=', ''));
    const timestampStr = parts[4].replace('TS=', '');

    return {
      isValid: true,
      status: 'ACCEPTED',
      errorReason: null,
      parsedData: {
        deviceId,
        temperature,
        humidity,
        pressure,
        timestamp: new Date(timestampStr),
        timestampString: timestampStr
      },
      rawMessage: trimmedMessage
    };
  }

  // Syntactically rejected: Provide diagnostic reason
  let rejectionReason = 'Message failed formal regular expression syntax check.';
  const parts = trimmedMessage.split('|');

  if (parts.length < 5) {
    rejectionReason = `Message is missing required fields. Expected 5 pipe-delimited fields, received ${parts.length}.`;
  } else if (parts.length > 5) {
    rejectionReason = `Message contains unexpected extraneous fields. Expected exactly 5 fields, received ${parts.length}.`;
  } else {
    // Inspect each field individually to pinpoint syntax violation
    const [pId, pTemp, pHum, pPress, pTs] = parts;

    if (!/^IOT-\d{3}$/.test(pId)) {
      rejectionReason = `Invalid Device ID token '${pId}'. Format must be 'IOT-XXX' where XXX is exactly 3 digits.`;
    } else if (!/^TEMP=-?\d+(\.\d+)?$/.test(pTemp)) {
      rejectionReason = `Invalid Temperature field '${pTemp}'. Must match 'TEMP=<number>' (e.g., TEMP=24.5).`;
    } else if (!/^HUM=\d+(\.\d+)?$/.test(pHum)) {
      rejectionReason = `Invalid Humidity field '${pHum}'. Must match 'HUM=<positive_number>' (e.g., HUM=45).`;
    } else if (!/^PRESS=\d+(\.\d+)?$/.test(pPress)) {
      rejectionReason = `Invalid Pressure field '${pPress}'. Must match 'PRESS=<positive_number>' (e.g., PRESS=1013.2).`;
    } else if (!/^TS=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(pTs)) {
      rejectionReason = `Invalid Timestamp '${pTs}'. Must be ISO 8601 UTC with 'Z' suffix (e.g., TS=2026-11-13T10:30:00Z).`;
    } else {
      rejectionReason = 'Incorrect field order. Expected: IOT-XXX|TEMP=...|HUM=...|PRESS=...|TS=...';
    }
  }

  return {
    isValid: false,
    status: 'REJECTED',
    errorReason: rejectionReason,
    parsedData: null,
    rawMessage: trimmedMessage
  };
};

module.exports = {
  SENSOR_FRAME_REGEX,
  validateSensorMessage
};
