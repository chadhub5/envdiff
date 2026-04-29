/**
 * compareCommand.js — CLI handler for the `compare` subcommand
 */

const { parseEnvFile } = require('./parser');
const { buildComparisonRows, compareSummary, similarityScore } = require('./envCompare');
const { labelFromPath } = require('./resolve');
const chalk = require('chalk');

const STATUS_ICONS = {
  match: chalk.green('✔'),
  mismatch: chalk.yellow('≠'),
  missing_left: chalk.red('←'),
  missing_right: chalk.red('→'),
};

function renderTable(rows, labelA, labelB) {
  const colW = 28;
  const header = [
    'KEY'.padEnd(colW),
    labelA.slice(0, colW).padEnd(colW),
    labelB.slice(0, colW).padEnd(colW),
    'STATUS',
  ].join('  ');

  console.log(chalk.bold(header));
  console.log('─'.repeat(header.length));

  for (const row of rows) {
    const icon = STATUS_ICONS[row.status] || ' ';
    const left = row[labelA] != null ? row[labelA].slice(0, colW) : chalk.dim('(missing)');
    const right = row[labelB] != null ? row[labelB].slice(0, colW) : chalk.dim('(missing)');
    console.log(
      [
        row.key.padEnd(colW),
        String(left).padEnd(colW),
        String(right).padEnd(colW),
        icon,
      ].join('  ')
    );
  }
}

function compareCommand(fileA, fileB, opts = {}) {
  const envA = parseEnvFile(fileA);
  const envB = parseEnvFile(fileB);

  const labelA = opts.labelA || labelFromPath(fileA);
  const labelB = opts.labelB || labelFromPath(fileB);

  const rows = buildComparisonRows(envA, envB, labelA, labelB);
  const summary = compareSummary(rows);
  const score = similarityScore(envA, envB);

  if (opts.json) {
    console.log(JSON.stringify({ rows, summary, score }, null, 2));
    return;
  }

  renderTable(rows, labelA, labelB);
  console.log();
  console.log(
    `Total: ${summary.total}  ` +
    chalk.green(`Matches: ${summary.match}`) + '  ' +
    chalk.yellow(`Mismatches: ${summary.mismatch}`) + '  ' +
    chalk.red(`Missing: ${summary.missing_left + summary.missing_right}`)
  );
  console.log(`Similarity: ${(score * 100).toFixed(1)}%`);
}

module.exports = { compareCommand };
