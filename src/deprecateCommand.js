// deprecateCommand.js — CLI handler for the deprecate subcommand

const { parseEnvFile } = require('./parser');
const { loadConfig } = require('./config');
const { buildDeprecationMap, scanDeprecated, suggestMigrations, formatDeprecationReport } = require('./envDeprecate');

/**
 * Run the deprecate command against one or more env files.
 * @param {string[]} files - paths to .env files
 * @param {Object} flags - CLI flags (e.g. --json, --config)
 */
async function deprecateCommand(files, flags = {}) {
  if (!files || files.length === 0) {
    console.error('Error: at least one env file path is required.');
    process.exit(1);
  }

  const config = await loadConfig(flags.config || null);
  const deprecations = config.deprecations || {};

  if (Object.keys(deprecations).length === 0) {
    console.log('No deprecation rules configured. Add a "deprecations" section to your envdiff config.');
    return;
  }

  const deprecationMap = buildDeprecationMap(deprecations);
  const results = [];

  for (const filePath of files) {
    const env = parseEnvFile(filePath);
    const findings = scanDeprecated(env, deprecationMap);
    const migrations = suggestMigrations(env, findings);
    results.push({ file: filePath, findings, migrations });
  }

  if (flags.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  for (const result of results) {
    console.log(`\n=== ${result.file} ===`);
    console.log(formatDeprecationReport(result.findings, result.migrations));
  }

  const totalFindings = results.reduce((sum, r) => sum + r.findings.length, 0);
  if (totalFindings > 0) process.exit(1);
}

module.exports = { deprecateCommand };
