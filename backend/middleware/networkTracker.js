/**
 * Computer Networks Telemetry & Request Diagnostics Middleware
 * Tracks live HTTP network traffic, response times (RTT), status code frequencies,
 * and endpoint activity for real-time network monitoring without simulated metrics.
 */

const networkMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalDurationMs: 0,
  averageResponseTimeMs: 0,
  methods: {
    GET: 0,
    POST: 0,
    PUT: 0,
    DELETE: 0,
    OPTIONS: 0,
    OTHER: 0
  },
  statusCodes: {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0
  },
  endpointActivity: {},
  recentRequests: [] // Rolling buffer of the last 30 requests
};

const MAX_RECENT_REQUESTS = 30;

const networkTracker = (req, res, next) => {
  const startTime = process.hrtime();
  const requestTimestamp = new Date().toISOString();

  // Update request counts
  networkMetrics.totalRequests++;
  const method = req.method.toUpperCase();
  if (networkMetrics.methods[method] !== undefined) {
    networkMetrics.methods[method]++;
  } else {
    networkMetrics.methods.OTHER++;
  }

  // Intercept the response finish event to capture duration and status code
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    // Duration in milliseconds with 2 decimal precision
    const durationMs = Number(((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2));

    networkMetrics.totalDurationMs += durationMs;
    networkMetrics.averageResponseTimeMs = Number(
      (networkMetrics.totalDurationMs / networkMetrics.totalRequests).toFixed(2)
    );

    const statusCode = res.statusCode;
    if (statusCode >= 200 && statusCode < 300) {
      networkMetrics.successfulRequests++;
      networkMetrics.statusCodes['2xx']++;
    } else if (statusCode >= 300 && statusCode < 400) {
      networkMetrics.statusCodes['3xx']++;
    } else if (statusCode >= 400 && statusCode < 500) {
      networkMetrics.failedRequests++;
      networkMetrics.statusCodes['4xx']++;
    } else if (statusCode >= 500) {
      networkMetrics.failedRequests++;
      networkMetrics.statusCodes['5xx']++;
    }

    // Endpoint frequency tracker (sanitized path without query strings)
    const sanitizedPath = req.baseUrl || req.path;
    networkMetrics.endpointActivity[sanitizedPath] =
      (networkMetrics.endpointActivity[sanitizedPath] || 0) + 1;

    // Push into recent requests rolling buffer
    networkMetrics.recentRequests.unshift({
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      timestamp: requestTimestamp
    });

    if (networkMetrics.recentRequests.length > MAX_RECENT_REQUESTS) {
      networkMetrics.recentRequests.pop();
    }
  });

  next();
};

/**
 * Returns current snapshot of network diagnostics
 */
const getNetworkMetrics = () => {
  return {
    ...networkMetrics,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  networkTracker,
  getNetworkMetrics
};
