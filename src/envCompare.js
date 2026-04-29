/**
 * envCompare.js — Side-by-side comparison of two env objects with similarity scoring
 */

/**
 * Compute a similarity ratio between two env maps (0–1).
 * @param {Object} envA
 * @param {Object} envB
 * @returns {number}
 */
function similarityScore(envA, envB) {
  const keysA = new Set(Object.keys(envA));
  const keysB = new Set(Object.keys(envB));
  const allKeys = new Set([...keysA, ...keysB]);
  if (allKeys.size === 0) return 1;

  let matches = 0;
  for (const key of allKeys) {
    if (keysA.has(key) && keysB.has(key) && envA[key] === envB[key]) {
      matches++;
    }
  }
  return matches / allKeys.size;
}

/**
 * Build a side-by-side comparison row for each key.
 * @param {Object} envA
 * @param {Object} envB
 * @param {string} labelA
 * @param {string} labelB
 * @returns {Array<{key, left, right, status}>}
 */
function buildComparisonRows(envA, envB, labelA = 'A', labelB = 'B') {
  const allKeys = Array.from(
    new Set([...Object.keys(envA), ...Object.keys(envB)])
  ).sort();

  return allKeys.map((key) => {
    const inA = Object.prototype.hasOwnProperty.call(envA, key);
    const inB = Object.prototype.hasOwnProperty.call(envB, key);

    let status;
    if (!inA) status = 'missing_left';
    else if (!inB) status = 'missing_right';
    else if (envA[key] !== envB[key]) status = 'mismatch';
    else status = 'match';

    return {
      key,
      [labelA]: inA ? envA[key] : null,
      [labelB]: inB ? envB[key] : null,
      status,
    };
  });
}

/**
 * Summarise a comparison result.
 * @param {Array} rows
 * @returns {Object}
 */
function compareSummary(rows) {
  const counts = { match: 0, mismatch: 0, missing_left: 0, missing_right: 0 };
  for (const row of rows) counts[row.status]++;
  return { total: rows.length, ...counts };
}

module.exports = { similarityScore, buildComparisonRows, compareSummary };
