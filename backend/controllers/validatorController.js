/**
 * Message Validator Controller
 * Exposes endpoints for interactive regular expression syntax testing.
 */

const { validateSensorMessage, SENSOR_FRAME_REGEX } = require('../validators/sensorRegex');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Test a candidate sensor frame against the formal Regular Expression
 * POST /api/validator/test
 */
const testMessageValidation = (req, res) => {
  const { message } = req.body;

  if (message === undefined || message === null) {
    return sendError(res, "Field 'message' is required in request body", 400);
  }

  const result = validateSensorMessage(message);

  return sendSuccess(
    res,
    {
      ...result,
      regexPattern: SENSOR_FRAME_REGEX.source
    },
    200,
    result.isValid ? 'Message accepted by formal grammar' : 'Message rejected by formal grammar'
  );
};

/**
 * Retrieve curated sample valid and invalid messages for demonstration
 * GET /api/validator/samples
 */
const getValidatorSamples = (req, res) => {
  const samples = {
    validSamples: [
      {
        description: 'Standard nominal telemetry frame',
        message: 'IOT-001|TEMP=25.4|HUM=48.2|PRESS=1013.2|TS=2026-11-13T10:30:00Z'
      },
      {
        description: 'Sub-zero thermal telemetry',
        message: 'IOT-002|TEMP=-4.2|HUM=55.0|PRESS=998.5|TS=2026-11-13T11:00:00Z'
      },
      {
        description: 'High-temperature industrial sensor reading',
        message: 'IOT-003|TEMP=38.6|HUM=22.1|PRESS=1022.0|TS=2026-11-13T12:15:30Z'
      }
    ],
    invalidSamples: [
      {
        description: 'Missing Device ID prefix',
        message: 'TEMP=25.4|HUM=48.2|PRESS=1013.2|TS=2026-11-13T10:30:00Z',
        expectedError: 'Expected 5 pipe-delimited fields, received 4'
      },
      {
        description: 'Non-numeric temperature value (Alphabetic)',
        message: 'IOT-001|TEMP=OVERHEAT|HUM=48.2|PRESS=1013.2|TS=2026-11-13T10:30:00Z',
        expectedError: 'Invalid Temperature field'
      },
      {
        description: 'Malformed timestamp (Missing Z UTC indicator)',
        message: 'IOT-001|TEMP=25.4|HUM=48.2|PRESS=1013.2|TS=2026-11-13 10:30:00',
        expectedError: 'Invalid Timestamp'
      },
      {
        description: 'Swapped token order (Humidity before Temperature)',
        message: 'IOT-001|HUM=48.2|TEMP=25.4|PRESS=1013.2|TS=2026-11-13T10:30:00Z',
        expectedError: 'Incorrect field order'
      },
      {
        description: 'Extraneous unexpected parameter appended',
        message: 'IOT-001|TEMP=25.4|HUM=48.2|PRESS=1013.2|TS=2026-11-13T10:30:00Z|BATTERY=90',
        expectedError: 'Unexpected extraneous fields'
      }
    ]
  };

  return sendSuccess(res, samples, 200, 'Sample validation test cases retrieved');
};

module.exports = {
  testMessageValidation,
  getValidatorSamples
};
