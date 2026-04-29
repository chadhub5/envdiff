/**
 * envPin.js — Pin a specific env key to an expected value and detect drift
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_PIN_FILE = '.envpins.json';

/**
 * Load pins from a JSON file
 * @param {string} pinFile
 * @returns {Record<string, string>}
 */
function loadPins(pinFile = DEFAULT_PIN_FILE) {
  if (!fs.existsSync(pinFile)) return {};
  try {
    const raw = fs.readFileSync(pinFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save pins to a JSON file
 * @param {Record<string, string>} pins
 * @param {string} pinFile
 */
function savePins(pins, pinFile = DEFAULT_PIN_FILE) {
  fs.writeFileSync(pinFile, JSON.stringify(pins, null, 2), 'utf8');
}

/**
 * Pin a key to its current value from an env map
 * @param {Record<string, string>} env
 * @param {string} key
 * @param {string} pinFile
 * @returns {{ key: string, value: string }}
 */
function pinKey(env, key, pinFile = DEFAULT_PIN_FILE) {
  if (!(key in env)) throw new Error(`Key "${key}" not found in env`);
  const pins = loadPins(pinFile);
  pins[key] = env[key];
  savePins(pins, pinFile);
  return { key, value: env[key] };
}

/**
 * Check env values against pinned expectations
 * @param {Record<string, string>} env
 * @param {string} pinFile
 * @returns {Array<{ key: string, pinned: string, actual: string|undefined, status: 'match'|'drift'|'missing' }>}
 */
function checkPins(env, pinFile = DEFAULT_PIN_FILE) {
  const pins = loadPins(pinFile);
  return Object.entries(pins).map(([key, pinned]) => {
    if (!(key in env)) return { key, pinned, actual: undefined, status: 'missing' };
    const actual = env[key];
    return { key, pinned, actual, status: actual === pinned ? 'match' : 'drift' };
  });
}

/**
 * Remove a key from pins
 * @param {string} key
 * @param {string} pinFile
 * @returns {boolean} true if removed, false if not found
 */
function unpin(key, pinFile = DEFAULT_PIN_FILE) {
  const pins = loadPins(pinFile);
  if (!(key in pins)) return false;
  delete pins[key];
  savePins(pins, pinFile);
  return true;
}

module.exports = { loadPins, savePins, pinKey, checkPins, unpin };
