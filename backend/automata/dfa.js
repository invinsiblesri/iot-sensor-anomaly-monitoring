/**
 * Formal Languages & Automata Theory (FLAT): 4-State Deterministic Finite Automaton (DFA)
 * 
 * Mathematical 5-Tuple Definition:
 * M = (Q, Sigma, delta, q0, F)
 * 
 * 1. Q = { NORMAL, WARNING, FAULTY, DISCONNECTED }
 * 2. Sigma = { a, b, c, d }
 * 3. delta : Q x Sigma -> Q (Deterministic Transition Function)
 * 4. q0 = NORMAL (Initial State)
 * 5. F = Q (All states are accepting operational monitoring states)
 */

class DeviceDFA {
  // Finite set of states (Q)
  static STATES = {
    NORMAL: 'NORMAL',
    WARNING: 'WARNING',
    FAULTY: 'FAULTY',
    DISCONNECTED: 'DISCONNECTED'
  };

  // Input alphabet (Sigma)
  static ALPHABET = {
    a: 'Normal reading',
    b: 'Warning reading',
    c: 'Faulty reading',
    d: 'Timeout / Disconnection'
  };

  static INITIAL_STATE = 'NORMAL';
  static ACCEPTING_STATES = ['NORMAL', 'WARNING', 'FAULTY', 'DISCONNECTED'];

  // Complete 16-transition deterministic transition table (delta: Q x Sigma -> Q)
  static TRANSITION_TABLE = {
    'NORMAL': {
      'a': 'NORMAL',
      'b': 'WARNING',
      'c': 'FAULTY',
      'd': 'DISCONNECTED'
    },
    'WARNING': {
      'a': 'NORMAL',
      'b': 'WARNING',
      'c': 'FAULTY',
      'd': 'DISCONNECTED'
    },
    'FAULTY': {
      'a': 'NORMAL',
      'b': 'WARNING',
      'c': 'FAULTY',
      'd': 'DISCONNECTED'
    },
    'DISCONNECTED': {
      'a': 'NORMAL',
      'b': 'WARNING',
      'c': 'FAULTY',
      'd': 'DISCONNECTED'
    }
  };

  /**
   * Execute deterministic transition function: delta(currentState, symbol) -> nextState
   * @param {string} currentState - Current state from Q
   * @param {string} inputSymbol - Symbol from Sigma ('a', 'b', 'c', 'd')
   * @returns {Object} Transition result
   */
  static transition(currentState, inputSymbol) {
    const stateKey = (currentState || this.INITIAL_STATE).toUpperCase();
    const symbolKey = (inputSymbol || '').toLowerCase();

    // Verification of state domain
    if (!this.TRANSITION_TABLE[stateKey]) {
      throw new Error(`Invalid state '${currentState}'. Must be one of: ${Object.keys(this.STATES).join(', ')}`);
    }

    // Verification of alphabet domain
    if (!this.ALPHABET[symbolKey]) {
      throw new Error(`Invalid input symbol '${inputSymbol}'. Must be one of: ${Object.keys(this.ALPHABET).join(', ')}`);
    }

    const nextState = this.TRANSITION_TABLE[stateKey][symbolKey];
    const isStateChanged = stateKey !== nextState;

    return {
      previousState: stateKey,
      inputSymbol: symbolKey,
      inputDescription: this.ALPHABET[symbolKey],
      nextState,
      isStateChanged,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Returns formal mathematical definition for educational UI and academic reports
   */
  static getAutomataDefinition() {
    return {
      formalName: 'Deterministic Finite Automaton (DFA)',
      tuple: 'M = (Q, Σ, δ, q₀, F)',
      states: Object.values(this.STATES),
      alphabet: this.ALPHABET,
      initialState: this.INITIAL_STATE,
      acceptingStates: this.ACCEPTING_STATES,
      transitionTable: this.TRANSITION_TABLE,
      properties: {
        isDeterministic: true,
        epsilonTransitionsAllowed: false,
        totalTransitions: 16,
        proofOfDeterminism: 'Every state q in Q has exactly one uniquely defined transition for every symbol sigma in Sigma with zero non-deterministic branchings.'
      }
    };
  }
}

module.exports = DeviceDFA;
