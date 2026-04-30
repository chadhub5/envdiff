/**
 * secretCommand.js — CLI handler for the secret scan command
 */

const { parseEnvFile } = require('./parser');
const { scanSecrets, secretSummary } = require('./envSecret');

function formatFindings(findings, { verbose = false } = {}) {
  if (findings.length === 0) {
    return '✅  No secrets detected.';
  }
  const lines = [`⚠️  Found ${findings.length} potential secret(s):\n`];
  for (const f of findings) {
    const tags = [];
    if (f.byKey) tags.push('sensitive-key');
    if (f.byValue) tags.push(`value:${f.byValue}`);
    lines.push(`  • ${f.key}  [${tags.join(', ')}]`);
  }
  return lines.join('\n');
}

function secretCommand(argv) {
  const files = argv.files;
  if (!files || files.length === 0) {
    console.error('Usage: envdiff secret <file> [file2 ...]');
    process.exit(1);
  }

  let exitCode = 0;

  for (const file of files) {
    let env;
    try {
      env = parseEnvFile(file);
    } catch (err) {
      console.error(`Cannot read ${file}: ${err.message}`);
      process.exit(1);
    }

    const findings = scanSecrets(env);
    const summary = secretSummary(findings);

    if (argv.json) {
      console.log(JSON.stringify({ file, findings, summary }, null, 2));
    } else {
      console.log(`\n📄 ${file}`);
      console.log(formatFindings(findings, { verbose: argv.verbose }));
      if (findings.length > 0) {
        console.log(`   Reasons: ${Object.entries(summary.byReason).map(([k, v]) => `${k}(${v})`).join(', ')}`);
      }
    }

    if (findings.length > 0) exitCode = 1;
  }

  if (argv.strict) process.exit(exitCode);
}

module.exports = { secretCommand, formatFindings };
