/**
 * Validates parsed env objects and reports structural issues.
 */

/**
 * Check that all required keys are present in a target env map.
 * @param {string[]} requiredKeys
 * @param {Map<string, string>} envMap
 * @returns {{ missing: string[] }}
 */
function checkRequired(requiredKeys, envMap) {
  const missing = requiredKeys.filter((key) => !envMap.has(key));
  return { missing };
}

/**
 * Check for keys that have empty values.
 * @param {Map<string, string>} envMap
 * @returns {{ empty: string[] }}
 */
function checkEmptyValues(envMap) {
  const empty = [];
  for (const [key, value] of envMap.entries()) {
    if (value === '' || value === null || value === undefined) {
      empty.push(key);
    }
  }
  return { empty };
}

/**
 * Check for duplicate keys in raw env content lines.
 * @param {string} content
 * @returns {{ duplicates: string[] }}
 */
function checkDuplicates(content) {
  const seen = new Set();
  const duplicates = new Set();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (seen.has(key)) {
      duplicates.add(key);
    } else {
      seen.add(key);
    }
  }
  return { duplicates: Array.from(duplicates) };
}

/**
 * Run all validations and return a combined result.
 * @param {string} content  Raw file content
 * @param {Map<string, string>} envMap  Parsed env map
 * @param {string[]} [requiredKeys]
 * @returns {{ missing: string[], empty: string[], duplicates: string[], valid: boolean }}
 */
function validateEnv(content, envMap, requiredKeys = []) {
  const { missing } = checkRequired(requiredKeys, envMap);
  const { empty } = checkEmptyValues(envMap);
  const { duplicates } = checkDuplicates(content);
  const valid = missing.length === 0 && duplicates.length === 0;
  return { missing, empty, duplicates, valid };
}

module.exports = { checkRequired, checkEmptyValues, checkDuplicates, validateEnv };
