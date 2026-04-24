/**
 * Config loader — reads envdiff configuration from a local
 * .envdiffrc.json file or falls back to sensible defaults.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  format: 'text',
  ignoreKeys: [],
  strict: false,
  timestamp: false,
  exitOnDiff: true,
};

const RC_FILENAME = '.envdiffrc.json';

/**
 * Search for a config file starting from startDir and walking up.
 * @param {string} startDir
 * @returns {string|null}
 */
function findConfigFile(startDir) {
  let dir = path.resolve(startDir);
  const root = path.parse(dir).root;

  while (dir !== root) {
    const candidate = path.join(dir, RC_FILENAME);
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * Load and merge config from file (if found) with defaults.
 * @param {string} [startDir=process.cwd()]
 * @returns {object}
 */
function loadConfig(startDir = process.cwd()) {
  const configPath = findConfigFile(startDir);
  if (!configPath) return { ...DEFAULT_CONFIG };

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (err) {
    console.warn(`[envdiff] Could not parse ${configPath}: ${err.message}`);
    return { ...DEFAULT_CONFIG };
  }
}

module.exports = { loadConfig, findConfigFile, DEFAULT_CONFIG, RC_FILENAME };
