/**
 * Automated Verification for FLAT Regex, FLAT DFA, and Simulation Engine (Phases 5-8)
 */

const { validateSensorMessage } = require('./validators/sensorRegex');
const DeviceDFA = require('./automata/dfa');
const { classifyReadingAlphabet } = require('./automata/alphabet');
const simulator = require('./simulation/sensorSimulator');

function runTests() {
  console.log('====================================================');
  console.log('    RUNNING FLAT & SIMULATION TEST SUITE (PHASES 5-8) ');
  console.log('====================================================');

  let testCount = 0;
  let passedCount = 0;

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

  // 1. FLAT Regex: Valid Message
  const valid = validateSensorMessage('IOT-001|TEMP=27.5|HUM=45|PRESS=1013.2|TS=2026-11-13T10:30:00Z');
  assert(valid.isValid && valid.status === 'ACCEPTED', 'Regex accepts valid full-string frame');
  assert(valid.parsedData.temperature === 27.5 && valid.parsedData.deviceId === 'IOT-001', 'Regex parsed tokens correctly');

  // 2. FLAT Regex: Rejections
  const badTemp = validateSensorMessage('IOT-001|TEMP=HOT|HUM=45|PRESS=1013.2|TS=2026-11-13T10:30:00Z');
  assert(!badTemp.isValid && badTemp.status === 'REJECTED' && badTemp.errorReason.includes('Temperature'), 'Regex rejects alphabetic temperature');

  const badId = validateSensorMessage('DEV-01|TEMP=25.0|HUM=45|PRESS=1013.2|TS=2026-11-13T10:30:00Z');
  assert(!badId.isValid && badId.errorReason.includes('Device ID'), 'Regex rejects non-standard device ID format');

  const missingPress = validateSensorMessage('IOT-001|TEMP=25.0|HUM=45|TS=2026-11-13T10:30:00Z');
  assert(!missingPress.isValid && missingPress.errorReason.includes('missing required fields'), 'Regex rejects missing field');

  const badTs = validateSensorMessage('IOT-001|TEMP=25.0|HUM=45|PRESS=1013.2|TS=2026-11-13 10:30:00');
  assert(!badTs.isValid && badTs.errorReason.includes('Timestamp'), 'Regex rejects non-ISO8601 timestamp');

  // 3. FLAT Alphabet Evaluation
  const thresholds = {
    temperatureThresholds: { normalMin: 18, normalMax: 30, warningMin: 5, warningMax: 40 },
    humidityThresholds: { normalMin: 30, normalMax: 60, warningMin: 15, warningMax: 80 },
    pressureThresholds: { normalMin: 980, normalMax: 1030, warningMin: 950, warningMax: 1050 }
  };

  const normSym = classifyReadingAlphabet({ temperature: 24, humidity: 45, pressure: 1013 }, thresholds);
  assert(normSym.symbol === 'a', 'Nominal metrics evaluate to Alphabet symbol "a"');

  const warnSym = classifyReadingAlphabet({ temperature: 35, humidity: 45, pressure: 1013 }, thresholds);
  assert(warnSym.symbol === 'b', 'Warning metric evaluates to Alphabet symbol "b"');

  const faultSym = classifyReadingAlphabet({ temperature: 48, humidity: 45, pressure: 1013 }, thresholds);
  assert(faultSym.symbol === 'c', 'Faulty metric evaluates to Alphabet symbol "c"');

  // 4. FLAT DFA: Deterministic Transitions
  const t1 = DeviceDFA.transition('NORMAL', 'a');
  assert(t1.nextState === 'NORMAL' && !t1.isStateChanged, 'DFA: delta(NORMAL, a) -> NORMAL');

  const t2 = DeviceDFA.transition('NORMAL', 'b');
  assert(t2.nextState === 'WARNING' && t2.isStateChanged, 'DFA: delta(NORMAL, b) -> WARNING');

  const t3 = DeviceDFA.transition('WARNING', 'c');
  assert(t3.nextState === 'FAULTY' && t3.isStateChanged, 'DFA: delta(WARNING, c) -> FAULTY');

  const t4 = DeviceDFA.transition('FAULTY', 'd');
  assert(t4.nextState === 'DISCONNECTED' && t4.isStateChanged, 'DFA: delta(FAULTY, d) -> DISCONNECTED');

  const t5 = DeviceDFA.transition('DISCONNECTED', 'a');
  assert(t5.nextState === 'NORMAL' && t5.isStateChanged, 'DFA: delta(DISCONNECTED, a) -> NORMAL (Recovery)');

  // 5. Total 16 transitions check
  let allTransitionsValid = true;
  for (const s of Object.keys(DeviceDFA.STATES)) {
    for (const sym of Object.keys(DeviceDFA.ALPHABET)) {
      const res = DeviceDFA.transition(s, sym);
      if (!DeviceDFA.STATES[res.nextState]) allTransitionsValid = false;
    }
  }
  assert(allTransitionsValid, 'All 16 deterministic transitions are completely and uniquely mapped');

  // 6. Simulation Controls
  const simStatus = simulator.getStatus();
  assert(simStatus.managedDevices.length === 5, 'Simulator manages exactly 5 devices (IOT-001 to IOT-005)');

  const anomRes = simulator.triggerAnomaly('IOT-001', 'FAULTY');
  assert(anomRes.success, 'Simulator accepts manual anomaly trigger for IOT-001');

  const discRes = simulator.disconnectDevice('IOT-002');
  assert(discRes.success, 'Simulator accepts disconnect command for IOT-002');

  const restRes = simulator.restoreDevice('IOT-002');
  assert(restRes.success, 'Simulator accepts restore command for IOT-002');

  console.log('====================================================');
  console.log(`RESULTS: ${passedCount} / ${testCount} tests passed.`);
  if (passedCount === testCount) {
    console.log('>>> PHASES 5-8 FLAT & SIMULATION TEST SUITE: PASSED <<<');
  } else {
    console.error('>>> TESTS FAILED <<<');
    process.exit(1);
  }
}

runTests();
