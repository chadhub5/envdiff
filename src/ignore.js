/**
 * Ignore helper — filters diff results based on a list of keys
 * that should be excluded from comparison (e.g. auto-generated or
 * environment-specific keys that intentionally differ).
 */

/**
 * Remove ignored keys from a flat array of key strings.
 * @param {string[]} keys
 * @param {string[]} ignoreList
 * @returns {string[]}
 */
function filterKeys(keys, ignoreList) {
  if (!ignoreList || ignoreList.length === 0) return keys;
  const set = new Set(ignoreList);
  return keys.filter((k) => !set.has(k));
}

/**
 * Apply the ignore list to all categories of a diff result,
 * returning a new diff object with ignored keys removed.
 * @param {object} diff  — { missing, extra, mismatch }
 * @param {string[]} ignoreList
 * @returns {object}
 */
function applyIgnore(diff, ignoreList) {
  if (!ignoreList || ignoreList.length === 0) return diff;
  return {
    missing: filterKeys(diff.missing || [], ignoreList),
    extra: filterKeys(diff.extra || [], ignoreList),
    mismatch: filterKeys(diff.mismatch || [], ignoreList),
  };
}

/**
 * Merge two ignore lists, deduplicating entries.
 * @param {string[]} a
 * @param {string[]} b
 * @returns {string[]}
 */
function mergeIgnoreLists(a, b) {
  return [...new Set([...(a || []), ...(b || [])])];
}

module.exports = { filterKeys, applyIgnore, mergeIgnoreLists };
