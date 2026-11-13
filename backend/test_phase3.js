/**
 * Phase 3 Automated Verification Test
 * Tests Mongoose schemas, field validations, enum constraints, compound indexes, and DB diagnostics.
 */

const mongoose = require('mongoose');
const { Device, SensorReading, Alert, StateTransition, SystemSettings } = require('./models');
const { getDBStatus } = require('./config/db');

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('       RUNNING PHASE 3 SCHEMAS & DB TEST SUITE      ');
  console.log('====================================================');
  let passedCount = 0;
  let testCount = 0;

  function assert(condition, message) {
    testCount++;
    if (condition) {
      console.log(`[PASS] Test ${testCount}: ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] Test ${testCount}: ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Device Schema Validation
  const validDevice = new Device({
    deviceId: 'IOT-001',
    deviceName: 'Server Room 1',
    location: 'Zone A',
    currentState: 'NORMAL'
  });
  const devErr = validDevice.validateSync();
  assert(!devErr, 'Valid Device schema passes validation');

  const invalidDevState = new Device({
    deviceId: 'IOT-002',
    deviceName: 'Bad State Node',
    location: 'Zone B',
    currentState: 'SUPER_CRITICAL' // Invalid enum
  });
  const badStateErr = invalidDevState.validateSync();
  assert(badStateErr && badStateErr.errors.currentState, 'Device rejects invalid state enum (SUPER_CRITICAL)');

  const missingDevId = new Device({
    deviceName: 'No ID Sensor',
    location: 'Zone C'
  });
  const noIdErr = missingDevId.validateSync();
  assert(noIdErr && noIdErr.errors.deviceId, 'Device rejects missing deviceId');

  // 2. SensorReading Schema Validation & Indexing
  const validReading = new SensorReading({
    deviceId: 'IOT-001',
    temperature: 24.5,
    humidity: 45.0,
    pressure: 1013.2,
    timestamp: new Date(),
    stateAtReading: 'NORMAL',
    rawMessage: 'IOT-001|TEMP=24.5|HUM=45.0|PRESS=1013.2|TS=2026-11-13T21:59:33Z'
  });
  const readingErr = validReading.validateSync();
  assert(!readingErr, 'Valid SensorReading schema passes validation');

  const missingTempReading = new SensorReading({
    deviceId: 'IOT-001',
    humidity: 45.0,
    pressure: 1013.2,
    timestamp: new Date(),
    stateAtReading: 'NORMAL',
    rawMessage: 'Malformed'
  });
  const noTempErr = missingTempReading.validateSync();
  assert(noTempErr && noTempErr.errors.temperature, 'SensorReading rejects missing temperature');

  const indexes = SensorReading.schema.indexes();
  const hasCompoundIndex = indexes.some(idx => {
    const fields = idx[0];
    return fields.deviceId === 1 && fields.timestamp === -1;
  });
  assert(hasCompoundIndex, 'SensorReading schema defines compound index { deviceId: 1, timestamp: -1 }');

  // 3. Alert Schema Validation
  const validAlert = new Alert({
    deviceId: 'IOT-003',
    alertType: 'FAULTY',
    severity: 'HIGH',
    message: 'Temperature exceeded critical limits (45°C)'
  });
  const alertErr = validAlert.validateSync();
  assert(!alertErr && validAlert.acknowledged === false, 'Valid Alert validates with default acknowledged=false');

  const invalidAlertSeverity = new Alert({
    deviceId: 'IOT-003',
    alertType: 'FAULTY',
    severity: 'CATASTROPHIC', // Not in enum
    message: 'Faulty'
  });
  const badSevErr = invalidAlertSeverity.validateSync();
  assert(badSevErr && badSevErr.errors.severity, 'Alert rejects invalid severity enum');

  // 4. StateTransition Schema & DFA Alphabet Validation
  const validTransition = new StateTransition({
    deviceId: 'IOT-001',
    previousState: 'NORMAL',
    inputSymbol: 'b',
    nextState: 'WARNING'
  });
  const transErr = validTransition.validateSync();
  assert(!transErr, 'Valid StateTransition validates symbol "b" and states');

  const invalidSymbolTransition = new StateTransition({
    deviceId: 'IOT-001',
    previousState: 'NORMAL',
    inputSymbol: 'x', // Invalid DFA alphabet symbol
    nextState: 'WARNING'
  });
  const badSymErr = invalidSymbolTransition.validateSync();
  assert(badSymErr && badSymErr.errors.inputSymbol, 'StateTransition rejects invalid alphabet symbol (x)');

  // 5. SystemSettings Schema Defaults
  const settingsDoc = new SystemSettings({});
  assert(
    settingsDoc.temperatureThresholds.normalMin === 18 &&
    settingsDoc.temperatureThresholds.normalMax === 30 &&
    settingsDoc.disconnectTimeout === 15 &&
    settingsDoc.simulationInterval === 3,
    'SystemSettings initializes correct baseline thresholds and timeouts'
  );

  // 6. DB Diagnostics Function
  const dbStatus = getDBStatus();
  assert(
    typeof dbStatus.isConnected === 'boolean' &&
    typeof dbStatus.status === 'string' &&
    dbStatus.modelsLoaded >= 5,
    'getDBStatus() returns connection diagnostic metrics with loaded Mongoose models'
  );

  console.log('====================================================');
  console.log(`RESULTS: ${passedCount} / ${testCount} tests passed.`);
  if (passedCount === testCount) {
    console.log('>>> PHASE 3 MONGOOSE SCHEMAS & DB DIAGNOSTICS: PASSED <<<');
  } else {
    console.error('>>> PHASE 3 TESTS FAILED <<<');
    process.exit(1);
  }
}

runPhase3Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
