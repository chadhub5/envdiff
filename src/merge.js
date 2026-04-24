/**
 * merge.js — Merge multiple .env files with conflict detection
 */

/**
 * Merge multiple parsed env objects into one.
 * Later entries override earlier ones; conflicts are tracked.
 * @param {Object[]} envObjects - Array of { name, data } objects
 * @returns {{ merged: Object, conflicts: Object }}
 */
function mergeEnvs(envObjects) {
  const merged = {};
  const conflicts = {};

  for (const { name, data } of envObjects) {
    for (const [key, value] of Object.entries(data)) {
      if (key in merged && merged[key] !== value) {
        if (!conflicts[key]) {
          conflicts[key] = [{ source: findSource(envObjects, key, merged[key]), value: merged[key] }];
        }
        conflicts[key].push({ source: name, value });
      }
      merged[key] = value;
    }
  }

  return { merged, conflicts };
}

/**
 * Find which source first defined a key with a given value.
 * @param {Object[]} envObjects
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function findSource(envObjects, key, value) {
  for (const { name, data } of envObjects) {
    if (data[key] === value) return name;
  }
  return 'unknown';
}

/**
 * Summarize the result of a merge operation.
 * @param {{ merged: Object, conflicts: Object }} mergeResult
 * @returns {Object}
 */
function mergeSummary(mergeResult) {
  const { merged, conflicts } = mergeResult;
  return {
    totalKeys: Object.keys(merged).length,
    conflictCount: Object.keys(conflicts).length,
    conflictKeys: Object.keys(conflicts),
    hasConflicts: Object.keys(conflicts).length > 0,
  };
}

module.exports = { mergeEnvs, mergeSummary, findSource };
