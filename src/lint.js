/**
 * lint.js — checks .env files for common style and convention issues
 */

/**
 * Check for keys that don't follow UPPER_SNAKE_CASE convention
 * @param {Object} env - parsed env object
 * @returns {Array} array of warning objects
 */
function checkNamingConvention(env) {
  const warnings = [];
  const pattern = /^[A-Z][A-Z0-9_]*$/;
  for (const key of Object.keys(env)) {
    if (!pattern.test(key)) {
      warnings.push({ key, rule: 'naming', message: `Key "${key}" should be UPPER_SNAKE_CASE` });
    }
  }
  return warnings;
}

/**
 * Check for keys with suspiciously long values (possible secrets pasted inline)
 * @param {Object} env
 * @param {number} maxLen
 * @returns {Array}
 */
function checkValueLength(env, maxLen = 200) {
  const warnings = [];
  for (const [key, value] of Object.entries(env)) {
    if (value && value.length > maxLen) {
      warnings.push({ key, rule: 'value-length', message: `Value for "${key}" exceeds ${maxLen} characters` });
    }
  }
  return warnings;
}

/**
 * Check for keys that look like they might contain secrets but have placeholder values
 * @param {Object} env
 * @returns {Array}
 */
function checkPlaceholderValues(env) {
  const placeholders = ['changeme', 'todo', 'fixme', 'placeholder', 'your_value_here', 'xxx'];
  const warnings = [];
  for (const [key, value] of Object.entries(env)) {
    if (value && placeholders.includes(value.toLowerCase())) {
      warnings.push({ key, rule: 'placeholder', message: `Value for "${key}" looks like a placeholder: "${value}"` });
    }
  }
  return warnings;
}

/**
 * Run all lint rules against a parsed env object
 * @param {Object} env
 * @param {Object} options
 * @returns {{ warnings: Array, clean: boolean }}
 */
function lintEnv(env, options = {}) {
  const { maxValueLength = 200, skipRules = [] } = options;
  let warnings = [];

  if (!skipRules.includes('naming')) {
    warnings = warnings.concat(checkNamingConvention(env));
  }
  if (!skipRules.includes('value-length')) {
    warnings = warnings.concat(checkValueLength(env, maxValueLength));
  }
  if (!skipRules.includes('placeholder')) {
    warnings = warnings.concat(checkPlaceholderValues(env));
  }

  return { warnings, clean: warnings.length === 0 };
}

module.exports = { checkNamingConvention, checkValueLength, checkPlaceholderValues, lintEnv };
