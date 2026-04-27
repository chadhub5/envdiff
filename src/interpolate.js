/**
 * interpolate.js
 * Resolves variable references within .env values (e.g. BASE_URL=${HOST}:${PORT})
 */

/**
 * Expand ${VAR} references in a single value string using the provided env map.
 * Supports default syntax: ${VAR:-default}
 * Unresolved references are left as-is.
 */
function expandValue(value, envMap) {
  return value.replace(/\$\{([^}]+)\}/g, (match, expr) => {
    const colonDash = expr.indexOf(':-');
    if (colonDash !== -1) {
      const varName = expr.slice(0, colonDash);
      const fallback = expr.slice(colonDash + 2);
      return Object.prototype.hasOwnProperty.call(envMap, varName)
        ? envMap[varName]
        : fallback;
    }
    return Object.prototype.hasOwnProperty.call(envMap, expr)
      ? envMap[expr]
      : match;
  });
}

/**
 * Interpolate all values in an env map, resolving self-references iteratively.
 * Performs up to maxPasses to handle chained references.
 */
function interpolateEnv(envMap, maxPasses = 10) {
  let current = { ...envMap };
  for (let pass = 0; pass < maxPasses; pass++) {
    const next = {};
    let changed = false;
    for (const [key, value] of Object.entries(current)) {
      const expanded = expandValue(value, current);
      next[key] = expanded;
      if (expanded !== value) changed = true;
    }
    current = next;
    if (!changed) break;
  }
  return current;
}

/**
 * Find all keys whose values contain unresolved ${VAR} references after interpolation.
 */
function findUnresolved(envMap) {
  const interpolated = interpolateEnv(envMap);
  const unresolved = [];
  for (const [key, value] of Object.entries(interpolated)) {
    if (/\$\{[^}]+\}/.test(value)) {
      unresolved.push({ key, value });
    }
  }
  return unresolved;
}

module.exports = { expandValue, interpolateEnv, findUnresolved };
