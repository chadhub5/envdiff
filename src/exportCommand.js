const path = require('path');
const { buildReport } = require('./reporter');
const { diffEnvs } = require('./diff');
const { parseEnvFile } = require('./parser');
const { loadConfig } = require('./config');
const { exportReport } = require('./export');

const SUPPORTED_FORMATS = ['json', 'dotenv', 'markdown'];

/**
 * CLI handler for the `export` subcommand.
 * Usage: envdiff export [files...] --format <fmt> --output <path>
 */
function exportCommand(argv) {
  const format = argv.format || argv.f || 'json';
  const outputPath = argv.output || argv.o;
  const files = argv._?.slice(1) || [];

  if (!SUPPORTED_FORMATS.includes(format)) {
    console.error(`Error: unsupported format "${format}". Choose from: ${SUPPORTED_FORMATS.join(', ')}`);
    process.exit(1);
  }

  if (!outputPath) {
    console.error('Error: --output <path> is required for export command.');
    process.exit(1);
  }

  if (files.length < 2) {
    console.error('Error: at least two .env files are required.');
    process.exit(1);
  }

  let config = {};
  try {
    config = loadConfig() || {};
  } catch (_) {
    // no config file, continue
  }

  const envMaps = {};
  for (const file of files) {
    try {
      envMaps[path.basename(file)] = parseEnvFile(file);
    } catch (err) {
      console.error(`Error reading ${file}: ${err.message}`);
      process.exit(1);
    }
  }

  const diff = diffEnvs(envMaps);
  const report = buildReport(diff, envMaps, config);

  try {
    const written = exportReport(report, outputPath, format);
    console.log(`Report exported to: ${written}`);
  } catch (err) {
    console.error(`Export failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { exportCommand, SUPPORTED_FORMATS };
