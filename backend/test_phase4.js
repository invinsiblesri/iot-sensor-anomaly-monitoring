/**
 * Phase 4 Automated Verification Test
 * Verifies Express REST routing, Computer Networks diagnostic tracking,
 * semantic HTTP status codes, and input validation handling.
 */

const app = require('./server');

const TEST_PORT = 5002;

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('        RUNNING PHASE 4 REST APIS TEST SUITE        ');
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

  const baseUrl = `http://localhost:${TEST_PORT}`;

  try {
    // 1. Root Gateway Route
    const rootRes = await fetch(`${baseUrl}/`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200 && rootData.endpoints, 'Root endpoint (GET /) returns 200 OK with endpoint index');

    // 2. Health Check Route
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert(healthRes.status === 200 || healthRes.status === 503, 'Health endpoint (GET /api/health) returns valid status code');

    // 3. Central 404 Not Found Handler
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-endpoint-xyz`);
    const notFoundData = await notFoundRes.json();
    assert(notFoundRes.status === 404 && notFoundData.success === false, 'Non-existent route returns semantic 404 Bad Request with JSON error');

    // 4. Device Registration Input Validation (POST /api/devices without body)
    const badDevRes = await fetch(`${baseUrl}/api/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const badDevData = await badDevRes.json();
    assert(badDevRes.status === 400 && badDevData.success === false, 'POST /api/devices rejects empty body with 400 Bad Request');

    // 5. Sensor Reading Input Validation (POST /api/sensors/readings with missing fields)
    const badSensorRes = await fetch(`${baseUrl}/api/sensors/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'IOT-001' }) // Missing temp, hum, press
    });
    const badSensorData = await badSensorRes.json();
    assert(badSensorRes.status === 400 && badSensorData.success === false, 'POST /api/sensors/readings rejects incomplete payload with 400 Bad Request');

    // 6. Settings Validation (PUT /api/settings with invalid timeout)
    const badSettingsRes = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disconnectTimeout: 2 }) // Min is 5
    });
    const badSettingsData = await badSettingsRes.json();
    assert(badSettingsRes.status === 400 && badSettingsData.success === false, 'PUT /api/settings rejects out-of-range timeout (< 5s) with 400 Bad Request');

    // 7. Network Telemetry & Diagnostics Endpoint (GET /api/network/stats)
    const netRes = await fetch(`${baseUrl}/api/network/stats`);
    const netData = await netRes.json();
    assert(
      netRes.status === 200 &&
      netData.success === true &&
      netData.data.httpMetrics.totalRequests >= 6 &&
      netData.data.recentRequests.length > 0,
      'GET /api/network/stats tracks live request count, HTTP methods, and recent requests'
    );

    // 8. Computer Networks Layer Mapping Verification
    assert(
      netData.data.networkProtocolStack &&
      netData.data.networkProtocolStack.applicationLayer.includes('HTTP'),
      'Network telemetry exports formal OSI & TCP/IP protocol mapping metadata'
    );

    console.log('====================================================');
    console.log(`RESULTS: ${passedCount} / ${testCount} tests passed.`);
    if (passedCount === testCount && !hasFailed) {
      console.log('>>> PHASE 4 REST APIS & NETWORK TRACKER: PASSED <<<');
    } else {
      console.error('>>> PHASE 4 TESTS FAILED <<<');
    }
  } catch (err) {
    console.error('Test execution error:', err);
    hasFailed = true;
  } finally {
    server.close(() => {
      setTimeout(() => {
        process.exit(hasFailed ? 1 : 0);
      }, 100);
    });
  }
}

runPhase4Tests();
