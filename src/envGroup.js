/**
 * envGroup.js — Group env keys by prefix and analyze group coverage
 */

/**
 * Extract prefix from a key (e.g. DB_HOST -> DB, AWS_SECRET_KEY -> AWS)
 * @param {string} key
 * @returns {string}
 */
function extractPrefix(key) {
  const parts = key.split('_');
  return parts.length > 1 ? parts[0] : '__ungrouped__';
}

/**
 * Group keys by their prefix
 * @param {Object} env
 * @returns {Object<string, string[]>}
 */
function groupByPrefix(env) {
  const groups = {};
  for (const key of Object.keys(env)) {
    const prefix = extractPrefix(key);
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  }
  return groups;
}

/**
 * Compare groups across multiple envs
 * @param {Object<string, Object>} envMap - { label: envObject }
 * @returns {Object<string, Object>}
 */
function compareGroups(envMap) {
  const labels = Object.keys(envMap);
  const allGroups = new Set();

  for (const label of labels) {
    const groups = groupByPrefix(envMap[label]);
    for (const g of Object.keys(groups)) allGroups.add(g);
  }

  const result = {};
  for (const group of allGroups) {
    result[group] = {};
    for (const label of labels) {
      const groups = groupByPrefix(envMap[label]);
      result[group][label] = groups[group] || [];
    }
  }
  return result;
}

/**
 * Summarize group comparison — which groups are missing in which env
 * @param {Object} groupComparison
 * @returns {Array<{group: string, missingIn: string[]}>}
 */
function groupCoverageSummary(groupComparison) {
  const summary = [];
  for (const [group, envKeys] of Object.entries(groupComparison)) {
    const missingIn = Object.entries(envKeys)
      .filter(([, keys]) => keys.length === 0)
      .map(([label]) => label);
    if (missingIn.length > 0) {
      summary.push({ group, missingIn });
    }
  }
  return summary;
}

module.exports = { extractPrefix, groupByPrefix, compareGroups, groupCoverageSummary };
