/**
 * tagCommand.js — CLI handler for env tagging commands
 */

const { parseEnvFile } = require('./parser');
const { loadConfig } = require('./config');
const {
  buildTagIndex,
  annotateEnv,
  filterByTag,
  tagCoverageSummary,
  formatTagReport,
} = require('./envTag');

function tagCommand(argv) {
  const config = loadConfig(argv.config || null);
  const files = argv.files || argv._;

  if (!files || files.length === 0) {
    console.error('Error: at least one .env file is required.');
    process.exit(1);
  }

  const tagMap = (config && config.tags) || {};
  const tagIndex = buildTagIndex(tagMap);

  for (const filePath of files) {
    let env;
    try {
      env = parseEnvFile(filePath);
    } catch (err) {
      console.error(`Could not read ${filePath}: ${err.message}`);
      continue;
    }

    const annotated = annotateEnv(env, tagIndex);

    if (argv.filter) {
      const filtered = filterByTag(annotated, argv.filter);
      console.log(`\n[${filePath}] Keys tagged "${argv.filter}":`);
      if (filtered.length === 0) {
        console.log('  (none)');
      } else {
        for (const entry of filtered) {
          console.log(`  ${entry.key}`);
        }
      }
    } else {
      const summary = tagCoverageSummary(env, tagIndex);
      console.log(`\n[${filePath}]`);
      console.log(formatTagReport(summary));
    }
  }
}

module.exports = { tagCommand };
