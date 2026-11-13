/**
 * Formal Languages & Automata Theory (FLAT): Alphabet Classifier
 * 
 * Maps physical sensor measurements to formal input alphabet symbols:
 * Sigma = { a, b, c, d }
 * 
 * a = Normal reading (all metrics within nominal band)
 * b = Warning reading (at least one metric in warning band, none faulty)
 * c = Faulty reading (at least one metric in critical fault band)
 * d = Disconnection / Timeout (no data received within timeout window)
 */

/**
 * Classifies sensor measurements against active threshold boundaries
 * @param {Object} readings - { temperature, humidity, pressure }
 * @param {Object} thresholds - { temperatureThresholds, humidityThresholds, pressureThresholds }
 * @returns {string} Alphabet symbol ('a', 'b', or 'c') and parameter breakdown
 */
const classifyReadingAlphabet = (readings, thresholds) => {
  const { temperature, humidity, pressure } = readings;
  const tempThresh = thresholds.temperatureThresholds;
  const humThresh = thresholds.humidityThresholds;
  const pressThresh = thresholds.pressureThresholds;

  const violations = {
    faulty: [],
    warning: [],
    normal: []
  };

  // 1. Temperature Check
  if (temperature < tempThresh.warningMin || temperature > tempThresh.warningMax) {
    violations.faulty.push(`Temperature ${temperature}°C is in FAULTY range (<${tempThresh.warningMin}°C or >${tempThresh.warningMax}°C)`);
  } else if (temperature < tempThresh.normalMin || temperature > tempThresh.normalMax) {
    violations.warning.push(`Temperature ${temperature}°C is in WARNING range [${tempThresh.warningMin}-${tempThresh.normalMin}°C or ${tempThresh.normalMax}-${tempThresh.warningMax}°C]`);
  } else {
    violations.normal.push(`Temperature ${temperature}°C is NORMAL [${tempThresh.normalMin}-${tempThresh.normalMax}°C]`);
  }

  // 2. Humidity Check
  if (humidity < humThresh.warningMin || humidity > humThresh.warningMax) {
    violations.faulty.push(`Humidity ${humidity}% is in FAULTY range (<${humThresh.warningMin}% or >${humThresh.warningMax}%)`);
  } else if (humidity < humThresh.normalMin || humidity > humThresh.normalMax) {
    violations.warning.push(`Humidity ${humidity}% is in WARNING range [${humThresh.warningMin}-${humThresh.normalMin}% or ${humThresh.normalMax}-${humThresh.warningMax}%]`);
  } else {
    violations.normal.push(`Humidity ${humidity}% is NORMAL [${humThresh.normalMin}-${humThresh.normalMax}%]`);
  }

  // 3. Pressure Check
  if (pressure < pressThresh.warningMin || pressure > pressThresh.warningMax) {
    violations.faulty.push(`Pressure ${pressure} hPa is in FAULTY range (<${pressThresh.warningMin} or >${pressThresh.warningMax} hPa)`);
  } else if (pressure < pressThresh.normalMin || pressure > pressThresh.normalMax) {
    violations.warning.push(`Pressure ${pressure} hPa is in WARNING range [${pressThresh.warningMin}-${pressThresh.normalMin} or ${pressThresh.normalMax}-${pressThresh.warningMax} hPa]`);
  } else {
    violations.normal.push(`Pressure ${pressure} hPa is NORMAL [${pressThresh.normalMin}-${pressThresh.normalMax} hPa]`);
  }

  // Hierarchical Classification Priority
  // Priority 1: Any parameter in Faulty range -> Symbol 'c'
  if (violations.faulty.length > 0) {
    return {
      symbol: 'c',
      symbolName: 'Faulty Reading',
      severity: 'HIGH',
      description: violations.faulty.join('; '),
      breakdown: violations
    };
  }

  // Priority 2: Any parameter in Warning range -> Symbol 'b'
  if (violations.warning.length > 0) {
    return {
      symbol: 'b',
      symbolName: 'Warning Reading',
      severity: 'MEDIUM',
      description: violations.warning.join('; '),
      breakdown: violations
    };
  }

  // Priority 3: All parameters nominal -> Symbol 'a'
  return {
    symbol: 'a',
    symbolName: 'Normal Reading',
    severity: 'LOW',
    description: 'All sensor parameters within nominal operating ranges',
    breakdown: violations
  };
};

module.exports = {
  classifyReadingAlphabet
};
