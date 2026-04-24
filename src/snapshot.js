const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./parser');

/**
 * Save a snapshot of the current env file state to a JSON file.
 * @param {string} envPath - Path to the .env file
 * @param {string} snapshotDir - Directory to store snapshots
 * @returns {string} Path to the written snapshot file
 */
function saveSnapshot(envPath, snapshotDir = '.envdiff-snapshots') {
  const parsed = parseEnvFile(envPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = path.basename(envPath).replace(/^\./,  '');
  const snapshotName = `${baseName}-${timestamp}.json`;

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const snapshotPath = path.join(snapshotDir, snapshotName);
  const payload = {
    source: envPath,
    capturedAt: new Date().toISOString(),
    keys: parsed,
  };

  fs.writeFileSync(snapshotPath, JSON.stringify(payload, null, 2), 'utf8');
  return snapshotPath;
}

/**
 * Load a previously saved snapshot.
 * @param {string} snapshotPath - Path to the snapshot JSON file
 * @returns {{ source: string, capturedAt: string, keys: Record<string, string> }}
 */
function loadSnapshot(snapshotPath) {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${snapshotPath}`);
  }
  const raw = fs.readFileSync(snapshotPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * List all snapshots in a directory, sorted newest first.
 * @param {string} snapshotDir
 * @returns {string[]}
 */
function listSnapshots(snapshotDir = '.envdiff-snapshots') {
  if (!fs.existsSync(snapshotDir)) return [];
  return fs.readdirSync(snapshotDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(snapshotDir, f))
    .sort()
    .reverse();
}

module.exports = { saveSnapshot, loadSnapshot, listSnapshots };
