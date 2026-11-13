/**
 * Automata Theory Controller
 * Exposes formal DFA 5-tuple definition, interactive sandbox transition execution,
 * and transition history audit logs.
 */

const DeviceDFA = require('../automata/dfa');
const { StateTransition } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Retrieve formal 5-tuple mathematical definition of the DFA
 * GET /api/automata/definition
 */
const getDefinition = (req, res) => {
  const definition = DeviceDFA.getAutomataDefinition();
  return sendSuccess(res, definition, 200, 'Automata definition retrieved');
};

/**
 * Execute a manual DFA state transition in the educational testbench
 * POST /api/automata/transition
 */
const simulateManualTransition = (req, res) => {
  try {
    const { currentState, inputSymbol } = req.body;

    if (!currentState || !inputSymbol) {
      return sendError(res, "Both 'currentState' and 'inputSymbol' are required", 400);
    }

    const result = DeviceDFA.transition(currentState, inputSymbol);
    return sendSuccess(res, result, 200, 'Deterministic transition executed successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

/**
 * Retrieve persistent transition history from MongoDB
 * GET /api/automata/history
 */
const getTransitionHistory = async (req, res, next) => {
  try {
    const { deviceId, limit = 50 } = req.query;
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

    const filter = {};
    if (deviceId) {
      filter.deviceId = deviceId.toUpperCase();
    }

    const history = await StateTransition.find(filter)
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .lean();

    return sendSuccess(res, history, 200, 'State transition history retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDefinition,
  simulateManualTransition,
  getTransitionHistory
};
