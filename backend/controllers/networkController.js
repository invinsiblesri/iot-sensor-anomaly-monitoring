/**
 * Network Telemetry & Diagnostics Controller
 * Provides real-time network layer statistics, HTTP diagnostics, and OSI/TCP-IP reference data.
 */

const { getNetworkMetrics } = require('../middleware/networkTracker');
const { getDBStatus } = require('../config/db');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Retrieve comprehensive network telemetry
 * GET /api/network/stats
 */
const getNetworkStats = (req, res) => {
  const networkMetrics = getNetworkMetrics();
  const dbStatus = getDBStatus();
  const memUsage = process.memoryUsage();

  const networkStats = {
    server: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: {
        heapUsed: Number((memUsage.heapUsed / 1024 / 1024).toFixed(2)),
        heapTotal: Number((memUsage.heapTotal / 1024 / 1024).toFixed(2)),
        rss: Number((memUsage.rss / 1024 / 1024).toFixed(2))
      }
    },
    database: dbStatus,
    httpMetrics: {
      totalRequests: networkMetrics.totalRequests,
      successfulRequests: networkMetrics.successfulRequests,
      failedRequests: networkMetrics.failedRequests,
      averageResponseTimeMs: networkMetrics.averageResponseTimeMs,
      methods: networkMetrics.methods,
      statusCodes: networkMetrics.statusCodes,
      endpointActivity: networkMetrics.endpointActivity
    },
    recentRequests: networkMetrics.recentRequests,
    networkProtocolStack: {
      applicationLayer: 'HTTP/1.1 RESTful JSON API',
      transportLayer: 'Transmission Control Protocol (TCP) with TLS/SSL encryption',
      internetLayer: 'IPv4 / IPv6 packet routing',
      linkLayer: 'Ethernet / Wi-Fi local frame delivery'
    }
  };

  return sendSuccess(res, networkStats, 200, 'Network telemetry retrieved successfully');
};

module.exports = {
  getNetworkStats
};
