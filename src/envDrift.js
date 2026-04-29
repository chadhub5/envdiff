/**
 * envDrift.js — Detects value drift between two env snapshots over time.
 * Drift = keys that exist in both but whose values have changed.
 */

'use strict';

/**
 * Compare two parsed env objects and return keys whose values drifted.
 * @param {Object} before - key/value map from older snapshot
 * @param {Object} after  - key/value map from newer snapshot
 * @returns {Array<{key, before, after}>}
 */
function detectDrift(before, after) {
  const drifted = [];
  for (const key of Object.keys(before)) {
    if (Object.prototype.hasOwnProperty.call(after, key)) {
      if (before[key] !== after[key]) {
        drifted.push({ key, before: before[key], after: after[key] });
      }
    }
  }
  return drifted;
}

/**
 * Keys present in `before` but missing in `after`.
 */
function detectDropped(before, after) {
  return Object.keys(before).filter(
    (k) => !Object.prototype.hasOwnProperty.call(after, k)
  );
}

/**
 * Keys added in `after` that were not in `before`.
 */
function detectAdded(before, after) {
  return Object.keys(after).filter(
    (k) => !Object.prototype.hasOwnProperty.call(before, k)
  );
}

/**
 * Full drift report between two env snapshots.
 */
function buildDriftReport(before, after, labels = { before: 'before', after: 'after' }) {
  const drifted = detectDrift(before, after);
  const dropped = detectDropped(before, after);
  const added = detectAdded(before, after);

  return {
    labels,
    drifted,
    dropped,
    added,
    totalKeys: new Set([...Object.keys(before), ...Object.keys(after)]).size,
    driftCount: drifted.length,
    clean: drifted.length === 0 && dropped.length === 0 && added.length === 0,
  };
}

/**
 * Human-readable summary string for a drift report.
 */
function formatDriftReport(report) {
  const lines = [];
  lines.push(`Drift report: ${report.labels.before} → ${report.labels.after}`);
  lines.push(`  Total keys tracked : ${report.totalKeys}`);
  lines.push(`  Value changes      : ${report.driftCount}`);
  lines.push(`  Keys dropped       : ${report.dropped.length}`);
  lines.push(`  Keys added         : ${report.added.length}`);

  if (report.drifted.length) {
    lines.push('\nChanged values:');
    for (const { key, before, after } of report.drifted) {
      lines.push(`  ${key}`);
      lines.push(`    before: ${before}`);
      lines.push(`    after : ${after}`);
    }
  }
  if (report.dropped.length) {
    lines.push('\nDropped keys: ' + report.dropped.join(', '));
  }
  if (report.added.length) {
    lines.push('\nAdded keys: ' + report.added.join(', '));
  }
  if (report.clean) {
    lines.push('\nNo drift detected.');
  }
  return lines.join('\n');
}

module.exports = { detectDrift, detectDropped, detectAdded, buildDriftReport, formatDriftReport };
