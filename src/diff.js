/**
 * Core diffing logic: compares two parsed env objects and
 * returns missing keys and mismatched values.
 */

'use strict';

/**
 * @typedef {Object} DiffResult
 * @property {string[]} missingInB   - Keys present in A but not in B
 * @property {string[]} missingInA   - Keys present in B but not in A
 * @property {Array<{key: string, valueA: string, valueB: string}>} mismatched - Keys with different values
 */

/**
 * Compare two env objects.
 * @param {Record<string, string>} envA
 * @param {Record<string, string>} envB
 * @returns {DiffResult}
 */
function diffEnvs(envA, envB) {
  const keysA = new Set(Object.keys(envA));
  const keysB = new Set(Object.keys(envB));

  const missingInB = [];
  const missingInA = [];
  const mismatched = [];

  for (const key of keysA) {
    if (!keysB.has(key)) {
      missingInB.push(key);
    } else if (envA[key] !== envB[key]) {
      mismatched.push({ key, valueA: envA[key], valueB: envB[key] });
    }
  }

  for (const key of keysB) {
    if (!keysA.has(key)) {
      missingInA.push(key);
    }
  }

  return { missingInB, missingInA, mismatched };
}

/**
 * Returns true if the diff result has no differences.
 * @param {DiffResult} result
 * @returns {boolean}
 */
function isClean(result) {
  return (
    result.missingInA.length === 0 &&
    result.missingInB.length === 0 &&
    result.mismatched.length === 0
  );
}

module.exports = { diffEnvs, isClean };
