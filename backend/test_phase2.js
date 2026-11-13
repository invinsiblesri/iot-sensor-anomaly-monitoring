/**
 * Phase 2 Smoke Test: Express Server Health Check Verification
 */
const http = require('http');
const app = require('./server');

const TEST_PORT = 5001;

const server = app.listen(TEST_PORT, async () => {
  console.log(`[TEST] Test server listening on http://localhost:${TEST_PORT}`);
  try {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/health`);
    const data = await response.json();

    console.log('[TEST] Received response status:', response.status);
    console.log('[TEST] Payload:', JSON.stringify(data, null, 2));

    if (response.status === 200 && data.status === 'ONLINE') {
      console.log('>>> PHASE 2 SERVER SMOKE TEST: PASSED <<<');
      server.close(() => process.exit(0));
    } else {
      console.error('>>> PHASE 2 SERVER SMOKE TEST: FAILED (Unexpected payload) <<<');
      server.close(() => process.exit(1));
    }
  } catch (err) {
    console.error('>>> PHASE 2 SERVER SMOKE TEST: FAILED with error:', err.message);
    server.close(() => process.exit(1));
  }
});
