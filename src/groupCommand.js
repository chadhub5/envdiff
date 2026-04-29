/**
 * groupCommand.js — CLI handler for the group command
 */

const { parseEnvFile } = require('./parser');
const { compareGroups, groupCoverageSummary } = require('./envGroup');

/**
 * Render group comparison as a readable table
 * @param {Object} groupComparison
 * @param {string[]} labels
 * @returns {string}
 */
function renderGroupTable(groupComparison, labels) {
  const colWidth = 16;
  const pad = (s, w) => String(s).padEnd(w);
  const header = pad('GROUP', colWidth) + labels.map(l => pad(l, colWidth)).join('');
  const separator = '-'.repeat(colWidth * (labels.length + 1));
  const rows = Object.entries(groupComparison).map(([group, envKeys]) => {
    const cols = labels.map(label => {
      const count = envKeys[label] ? envKeys[label].length : 0;
      return pad(count > 0 ? `${count} key(s)` : '—', colWidth);
    });
    return pad(group, colWidth) + cols.join('');
  });
  return [header, separator, ...rows].join('\n');
}

/**
 * Main group command handler
 * @param {string[]} files
 * @param {Object} opts
 */
async function groupCommand(files, opts = {}) {
  if (files.length < 1) {
    console.error('Usage: envdiff group <file1> <file2> ...');
    process.exit(1);
  }

  const envMap = {};
  for (const file of files) {
    const label = file.replace(/.*[\/\\]/, '');
    envMap[label] = await parseEnvFile(file);
  }

  const labels = Object.keys(envMap);
  const groupComparison = compareGroups(envMap);
  const summary = groupCoverageSummary(groupComparison);

  if (opts.json) {
    console.log(JSON.stringify({ groups: groupComparison, summary }, null, 2));
    return;
  }

  console.log('\nEnv Key Groups\n');
  console.log(renderGroupTable(groupComparison, labels));

  if (summary.length > 0) {
    console.log('\nCoverage Issues:');
    for (const { group, missingIn } of summary) {
      console.log(`  [${group}] missing in: ${missingIn.join(', ')}`);
    }
  } else {
    console.log('\nAll groups present in all environments.');
  }
}

module.exports = { renderGroupTable, groupCommand };
