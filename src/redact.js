/**
 * redact.js — Masks sensitive values in env diffs before display or export
 */

const DEFAULT_SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passphrase/i,
];

const REDACTED = '***REDACTED***';

/**
 * Returns true if the key matches any sensitive pattern.
 * @param {string} key
 * @param {RegExp[]} patterns
 * @returns {boolean}
 */
function isSensitiveKey(key, patterns = DEFAULT_SENSITIVE_PATTERNS) {
  return patterns.some((pattern) => pattern.test(key));
}

/**
 * Redacts values in a flat env object for sensitive keys.
 * @param {Record<string, string>} envObj
 * @param {RegExp[]} [patterns]
 * @returns {Record<string, string>}
 */
function redactEnv(envObj, patterns = DEFAULT_SENSITIVE_PATTERNS) {
  const result = {};
  for (const [key, value] of Object.entries(envObj)) {
    result[key] = isSensitiveKey(key, patterns) ? REDACTED : value;
  }
  return result;
}

/**
 * Redacts values inside a diff result object (as produced by diffEnvs).
 * Each entry has { key, status, values: { [file]: string } }
 * @param {Array} diffEntries
 * @param {RegExp[]} [patterns]
 * @returns {Array}
 */
function redactDiff(diffEntries, patterns = DEFAULT_SENSITIVE_PATTERNS) {
  return diffEntries.map((entry) => {
    if (!isSensitiveKey(entry.key, patterns)) return entry;
    const redactedValues = {};
    for (const file of Object.keys(entry.values)) {
      redactedValues[file] =
        entry.values[file] !== undefined ? REDACTED : undefined;
    }
    return { ...entry, values: redactedValues };
  });
}

module.exports = {
  DEFAULT_SENSITIVE_PATTERNS,
  REDACTED,
  isSensitiveKey,
  redactEnv,
  redactDiff,
};
