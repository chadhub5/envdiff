/**
 * Parses the contents of a .env file into a key-value map.
 * Ignores blank lines and comment lines (starting with #).
 */

'use strict';

const fs = require('fs');

/**
 * Parse raw .env text content into an object.
 * @param {string} content - Raw text content of a .env file
 * @returns {Record<string, string>} Parsed key-value pairs
 */
function parseEnvContent(content) {
  const result = {};

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Read and parse a .env file from disk.
 * @param {string} filePath - Path to the .env file
 * @returns {Record<string, string>} Parsed key-value pairs
 */
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseEnvContent(content);
}

module.exports = { parseEnvContent, parseEnvFile };
