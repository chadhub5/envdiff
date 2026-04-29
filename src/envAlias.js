/**
 * envAlias.js — manage key aliases across env files
 * Allows mapping old key names to new ones for migration tracking.
 */

/**
 * Build an alias map from a plain object { oldKey: newKey }
 * @param {Object} raw
 * @returns {Map<string,string>}
 */
function buildAliasMap(raw = {}) {
  const map = new Map();
  for (const [from, to] of Object.entries(raw)) {
    if (typeof from === 'string' && typeof to === 'string') {
      map.set(from, to);
    }
  }
  return map;
}

/**
 * Resolve an env object by renaming aliased keys to their canonical names.
 * Original key is removed; canonical key is added if not already present.
 * @param {Object} env
 * @param {Map<string,string>} aliasMap
 * @returns {{ resolved: Object, applied: Array<{from,to}> }}
 */
function resolveAliases(env, aliasMap) {
  const resolved = { ...env };
  const applied = [];

  for (const [from, to] of aliasMap) {
    if (Object.prototype.hasOwnProperty.call(resolved, from)) {
      if (!Object.prototype.hasOwnProperty.call(resolved, to)) {
        resolved[to] = resolved[from];
        applied.push({ from, to });
      }
      delete resolved[from];
    }
  }

  return { resolved, applied };
}

/**
 * Detect keys in env that look like aliases (exist in aliasMap as sources)
 * but whose target key is missing.
 * @param {Object} env
 * @param {Map<string,string>} aliasMap
 * @returns {Array<{from, to}>}
 */
function detectStaleAliases(env, aliasMap) {
  const stale = [];
  for (const [from, to] of aliasMap) {
    const hasFrom = Object.prototype.hasOwnProperty.call(env, from);
    const hasTo = Object.prototype.hasOwnProperty.call(env, to);
    if (hasFrom && !hasTo) {
      stale.push({ from, to });
    }
  }
  return stale;
}

/**
 * Format alias resolution results as a human-readable string.
 * @param {Array<{from,to}>} applied
 * @param {Array<{from,to}>} stale
 * @returns {string}
 */
function formatAliasReport(applied, stale) {
  const lines = [];
  if (applied.length) {
    lines.push('Aliases resolved:');
    for (const { from, to } of applied) {
      lines.push(`  ${from} → ${to}`);
    }
  }
  if (stale.length) {
    lines.push('Stale aliases (old key present, new key missing):');
    for (const { from, to } of stale) {
      lines.push(`  ${from} → ${to} [MISSING TARGET]`);
    }
  }
  if (!lines.length) lines.push('No alias changes detected.');
  return lines.join('\n');
}

module.exports = { buildAliasMap, resolveAliases, detectStaleAliases, formatAliasReport };
