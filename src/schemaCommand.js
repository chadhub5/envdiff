/**
 * schemaCommand.js — CLI handler for `envdiff schema` command
 */

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./parser');
const { parseSchema, validateAgainstSchema } = require('./schema');

function schemaCommand(argv) {
  const { files = [], schema: schemaPath, json = false } = argv;

  if (!schemaPath) {
    console.error('Error: --schema <file> is required');
    process.exit(1);
  }

  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const schema = parseSchema(schemaContent);

  const results = {};
  let totalViolations = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn(`Warning: File not found, skipping: ${file}`);
      continue;
    }
    const env = parseEnvFile(file);
    const violations = validateAgainstSchema(env, schema);
    results[file] = violations;
    totalViolations += violations.length;
  }

  if (json) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(totalViolations > 0 ? 1 : 0);
  }

  for (const [file, violations] of Object.entries(results)) {
    const label = path.basename(file);
    if (violations.length === 0) {
      console.log(`✔  ${label} — no schema violations`);
    } else {
      console.log(`✖  ${label} — ${violations.length} violation(s):`);
      for (const v of violations) {
        console.log(`   [${v.rule}] ${v.message}`);
      }
    }
  }

  if (totalViolations > 0) process.exit(1);
}

module.exports = { schemaCommand };
