/**
 * template.js — Generate .env.example files from parsed env data
 */

const fs = require('fs');
const path = require('path');

/**
 * Replace all values with empty strings or placeholder comments
 * @param {Object} env - parsed env key/value map
 * @param {Object} options
 * @param {boolean} options.keepComments - preserve original values as comments
 * @param {string} options.placeholder - default placeholder string
 * @returns {Object} template key/value map
 */
function stripValues(env, options = {}) {
  const { keepComments = false, placeholder = '' } = options;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (keepComments && value) {
      result[key] = `# example: ${value}`;
    } else {
      result[key] = placeholder;
    }
  }
  return result;
}

/**
 * Serialize a template map back to .env file format
 * @param {Object} template
 * @returns {string}
 */
function serializeTemplate(template) {
  return Object.entries(template)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';
}

/**
 * Generate a template from one or more env maps (union of all keys)
 * @param {Object[]} envs - array of parsed env maps
 * @param {Object} options
 * @returns {Object} merged template
 */
function generateTemplate(envs, options = {}) {
  const merged = {};
  for (const env of envs) {
    for (const key of Object.keys(env)) {
      if (!(key in merged)) {
        merged[key] = env[key];
      }
    }
  }
  return stripValues(merged, options);
}

/**
 * Write a template to disk
 * @param {Object} template
 * @param {string} outputPath
 */
function writeTemplate(template, outputPath) {
  const content = serializeTemplate(template);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');
}

module.exports = { stripValues, serializeTemplate, generateTemplate, writeTemplate };
