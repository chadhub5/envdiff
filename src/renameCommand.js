/**
 * renameCommand.js — CLI command for suggesting key renames
 */

const { parseEnvFile } = require('./parser');
const { diffEnvs } = require('./diff');
const { suggestRenames, formatRenameSuggestions } = require('./envRename');

/**
 * Run the rename suggestion command.
 * @param {string} fileA  Path to first .env file
 * @param {string} fileB  Path to second .env file
 * @param {object} opts
 * @param {number} [opts.threshold=0.7]  Similarity threshold (0–1)
 * @param {boolean} [opts.json=false]    Output as JSON
 * @returns {void}
 */
function renameCommand(fileA, fileB, opts = {}) {
  const threshold = opts.threshold !== undefined ? parseFloat(opts.threshold) : 0.7;

  if (isNaN(threshold) || threshold < 0 || threshold > 1) {
    console.error('Error: --threshold must be a number between 0 and 1');
    process.exit(1);
  }

  let envA, envB;
  try {
    envA = parseEnvFile(fileA);
    envB = parseEnvFile(fileB);
  } catch (err) {
    console.error(`Error reading files: ${err.message}`);
    process.exit(1);
  }

  const diff = diffEnvs(envA, envB);
  const suggestions = suggestRenames(diff, threshold);

  if (opts.json) {
    console.log(JSON.stringify(suggestions, null, 2));
    return;
  }

  console.log(formatRenameSuggestions(suggestions));

  if (suggestions.length > 0) {
    console.log(`\nFound ${suggestions.length} suggestion(s) with threshold ${threshold}.`);
  }
}

module.exports = { renameCommand };
