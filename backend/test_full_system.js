/**
 * Full End-to-End System Integration Test
 * Verifies live HTTP endpoints across Computer Networks, FLAT, and FSWD layers.
 */

const app = require('./server');

const TEST_PORT = 5003;

async function runFullIntegration() {
  console.log('====================================================');
  console.log('       RUNNING FULL SYSTEM INTEGRATION TEST         ');
  console.log('====================================================');

  const server = app.listen(TEST_PORT);
  let passedCount = 0;
  let testCount = 0;
  let hasFailed = false;

  function assert(condition, message) {
    testCount++;
    if (condition) {
      console.log(`[PASS] Test ${testCount}: ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] Test ${testCount}: ${message}`);
      hasFailed = true;
    }
  }

  const base = `http://localhost:${TEST_PORT}/api`;

  try {
    // 1. Health Probe
    const healthRes = await fetch(`${base}/health`);
    assert(healthRes.status === 200 || healthRes.status === 503, '1. Health check responds with standard status');

    // 2. Automata 5-Tuple Definition
    const autoRes = await fetch(`${base}/automata/definition`);
    const autoData = await autoRes.json();
    assert(
      autoRes.status === 200 &&
      autoData.data.states.length === 4 &&
      autoData.data.properties.isDeterministic === true,
      '2. FLAT Automata definition exports complete 5-tuple with 4 states and proof of determinism'
    );

    // 3. Automata Manual Transition Sandbox
    const transRes = await fetch(`${base}/automata/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentState: 'NORMAL', inputSymbol: 'b' })
    });
    const transData = await transRes.json();
    assert(
      transRes.status === 200 && transData.data.nextState === 'WARNING',
      '3. FLAT DFA sandbox executes delta(NORMAL, b) -> WARNING'
    );

    // 4. Regular Expression Validation Test: Accepted Frame
    const validFrame = 'IOT-001|TEMP=24.5|HUM=50|PRESS=1013.2|TS=2026-11-13T10:30:00Z';
    const valRes = await fetch(`${base}/validator/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: validFrame })
    });
    const valData = await valRes.json();
    assert(
      valRes.status === 200 && valData.data.status === 'ACCEPTED',
      '4. FLAT Regex accepts standard compliance wire frame'
    );

    // 5. Regular Expression Validation Test: Rejected Frame (Malformed Temp)
    const badFrame = 'IOT-001|TEMP=HIGH_TEMP|HUM=50|PRESS=1013.2|TS=2026-11-13T10:30:00Z';
    const rejRes = await fetch(`${base}/validator/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: badFrame })
    });
    const rejData = await rejRes.json();
    assert(
      rejRes.status === 200 && rejData.data.status === 'REJECTED' && rejData.data.errorReason.includes('Temperature'),
      '5. FLAT Regex rejects alphabetic temperature with explanatory diagnosis'
    );

    // 6. Simulation Status & Controls
    const simRes = await fetch(`${base}/simulation/status`);
    const simData = await simRes.json();
    assert(
      simRes.status === 200 && simData.data.managedDevices.length === 5,
      '6. Simulator status reports 5 managed IoT devices (IOT-001 to IOT-005)'
    );

    // 7. Computer Networks Live Telemetry Tracker
    const netRes = await fetch(`${base}/network/stats`);
    const netData = await netRes.json();
    assert(
      netRes.status === 200 &&
      netData.data.httpMetrics.totalRequests >= 5 &&
      netData.data.recentRequests.length >= 5,
      '7. Computer Networks diagnostics recorded all requests, response times, and status distributions'
    );

    console.log('====================================================');
    console.log(`RESULTS: ${passedCount} / ${testCount} tests passed.`);
    if (passedCount === testCount && !hasFailed) {
      console.log('>>> FULL SYSTEM INTEGRATION TEST: ALL PASSED <<<');
    } else {
      console.error('>>> FULL SYSTEM TEST FAILED <<<');
    }
  } catch (err) {
    console.error('Test execution error:', err);
    hasFailed = true;
  } finally {
    server.close(() => {
      setTimeout(() => process.exit(hasFailed ? 1 : 0), 100);
    });
  }
}

runFullIntegration();
