/**
 * StateTransition Model Schema
 * Represents formal DFA transition audit logs executed by the automata engine.
 */

const mongoose = require('mongoose');

const stateTransitionSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID reference is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    previousState: {
      type: String,
      enum: {
        values: ['NORMAL', 'WARNING', 'FAULTY', 'DISCONNECTED'],
        message: '{VALUE} is not a valid previous state'
      },
      required: [true, 'Previous operational state is required']
    },
    inputSymbol: {
      type: String,
      enum: {
        values: ['a', 'b', 'c', 'd'],
        message: '{VALUE} is not a valid DFA alphabet symbol (must be a, b, c, or d)'
      },
      required: [true, 'Input alphabet symbol (a, b, c, d) is required']
    },
    nextState: {
      type: String,
      enum: {
        values: ['NORMAL', 'WARNING', 'FAULTY', 'DISCONNECTED'],
        message: '{VALUE} is not a valid destination state'
      },
      required: [true, 'Resulting operational state is required']
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying transitions by device ordered by timestamp
stateTransitionSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('StateTransition', stateTransitionSchema);
