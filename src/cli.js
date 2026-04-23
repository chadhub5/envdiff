#!/usr/bin/env node
'use strict';

const path = require('path');
const chalk = require('chalk');
const { parseEnvFile } = require('./parser');
const { diffEnvs, isClean } = require('./diff');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(chalk.red('Usage: envdiff <fileA> <fileB>'));
  console.error(chalk.gray('Example: envdiff .env .env.production'));
  process.exit(1);
}

const [fileA, fileB] = args.map((f) => path.resolve(process.cwd(), f));

let envA, envB;

try {
  envA = parseEnvFile(fileA);
} catch (e) {
  console.error(chalk.red(`Could not read file: ${fileA}`));
  process.exit(1);
}

try {
  envB = parseEnvFile(fileB);
} catch (e) {
  console.error(chalk.red(`Could not read file: ${fileB}`));
  process.exit(1);
}

const result = diffEnvs(envA, envB);

console.log(`\n${chalk.bold('envdiff')} — comparing:`);
console.log(`  A: ${chalk.cyan(fileA)}`);
console.log(`  B: ${chalk.cyan(fileB)}\n`);

if (isClean(result)) {
  console.log(chalk.green('✔ No differences found. Files are in sync.'));
  process.exit(0);
}

if (result.missingInB.length > 0) {
  console.log(chalk.yellow(`Missing in B (${path.basename(fileB)}):`));
  result.missingInB.forEach((k) => console.log(`  ${chalk.red('- ')}${k}`));
  console.log();
}

if (result.missingInA.length > 0) {
  console.log(chalk.yellow(`Missing in A (${path.basename(fileA)}):`));
  result.missingInA.forEach((k) => console.log(`  ${chalk.red('- ')}${k}`));
  console.log();
}

if (result.mismatched.length > 0) {
  console.log(chalk.yellow('Mismatched values:'));
  result.mismatched.forEach(({ key, valueA, valueB }) => {
    console.log(`  ${chalk.bold(key)}`);
    console.log(`    A: ${chalk.green(valueA || '(empty)')}`);
    console.log(`    B: ${chalk.red(valueB || '(empty)')}`);
  });
  console.log();
}

process.exit(1);
