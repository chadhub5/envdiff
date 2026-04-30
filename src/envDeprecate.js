// envDeprecate.js — track and report deprecated env keys

/**
 * Build a map of deprecated keys from a deprecation config.
 * @param {Object} deprecations - { KEY: { reason, replacement } }
 * @returns {Map}
 */
function buildDeprecationMap(deprecations = {}) {
  const map = new Map();
  for (const [key, meta] of Object.entries(deprecations)) {
    map.set(key, {
      reason: meta.reason || 'Deprecated',
      replacement: meta.replacement || null,
    });
  }
  return map;
}

/**
 * Scan an env object for deprecated keys.
 * @param {Object} env - parsed env key/value pairs
 * @param {Map} deprecationMap
 * @returns {Array<{ key, reason, replacement }>}
 */
function scanDeprecated(env, deprecationMap) {
  const findings = [];
  for (const key of Object.keys(env)) {
    if (deprecationMap.has(key)) {
      const meta = deprecationMap.get(key);
      findings.push({ key, reason: meta.reason, replacement: meta.replacement });
    }
  }
  return findings;
}

/**
 * Suggest migrations: keys that have a known replacement present or missing.
 * @param {Object} env
 * @param {Array} findings
 * @returns {Array<{ from, to, present }>}
 */
function suggestMigrations(env, findings) {
  return findings
    .filter(f => f.replacement)
    .map(f => ({
      from: f.key,
      to: f.replacement,
      present: Object.prototype.hasOwnProperty.call(env, f.replacement),
    }));
}

/**
 * Format a human-readable deprecation report.
 * @param {Array} findings
 * @param {Array} migrations
 * @returns {string}
 */
function formatDeprecationReport(findings, migrations) {
  if (findings.length === 0) return 'No deprecated keys found.';
  const lines = ['Deprecated keys found:'];
  for (const f of findings) {
    let line = `  [DEPRECATED] ${f.key} — ${f.reason}`;
    if (f.replacement) line += ` (replace with: ${f.replacement})`;
    lines.push(line);
  }
  if (migrations.length > 0) {
    lines.push('\nMigration suggestions:');
    for (const m of migrations) {
      const status = m.present ? '✓ replacement present' : '✗ replacement missing';
      lines.push(`  ${m.from} → ${m.to}  [${status}]`);
    }
  }
  return lines.join('\n');
}

module.exports = { buildDeprecationMap, scanDeprecated, suggestMigrations, formatDeprecationReport };
