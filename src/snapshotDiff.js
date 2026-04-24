const { loadSnapshot } = require('./snapshot');
const { diffEnvs } = require('./diff');

/**
 * Compare two snapshot files and return a diff result.
 * @param {string} snapshotPathA
 * @param {string} snapshotPathB
 * @returns {object} diff result from diffEnvs
 */
function diffSnapshots(snapshotPathA, snapshotPathB) {
  const snapA = loadSnapshot(snapshotPathA);
  const snapB = loadSnapshot(snapshotPathB);
  return diffEnvs(snapA.keys, snapB.keys);
}

/**
 * Compare a live env file against a saved snapshot.
 * @param {Record<string, string>} liveEnv - Parsed env object
 * @param {string} snapshotPath
 * @returns {object} diff result
 */
function diffAgainstSnapshot(liveEnv, snapshotPath) {
  const snap = loadSnapshot(snapshotPath);
  return diffEnvs(snap.keys, liveEnv);
}

/**
 * Build a human-readable summary of a snapshot diff.
 * @param {string} snapshotPathA
 * @param {string} snapshotPathB
 * @returns {string}
 */
function snapshotDiffSummary(snapshotPathA, snapshotPathB) {
  const snapA = loadSnapshot(snapshotPathA);
  const snapB = loadSnapshot(snapshotPathB);
  const diff = diffEnvs(snapA.keys, snapB.keys);

  const lines = [
    `Snapshot A: ${snapA.source} (captured ${snapA.capturedAt})`,
    `Snapshot B: ${snapB.source} (captured ${snapB.capturedAt})`,
    '',
  ];

  if (diff.added.length)    lines.push(`Added keys (${diff.added.length}):`,    ...diff.added.map(k => `  + ${k}`), '');
  if (diff.removed.length)  lines.push(`Removed keys (${diff.removed.length}):`,  ...diff.removed.map(k => `  - ${k}`), '');
  if (diff.changed.length)  lines.push(`Changed keys (${diff.changed.length}):`,  ...diff.changed.map(k => `  ~ ${k}`), '');
  if (!diff.added.length && !diff.removed.length && !diff.changed.length) {
    lines.push('No differences found.');
  }

  return lines.join('\n');
}

module.exports = { diffSnapshots, diffAgainstSnapshot, snapshotDiffSummary };
