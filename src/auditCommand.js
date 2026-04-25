/**
 * auditCommand.js — CLI handler for the audit subcommand
 */

const { loadAuditLog, filterAuditLog } = require('./audit');

function formatEntry(entry) {
  const { timestamp, files, summary, tag, user } = entry;
  const label = tag ? ` [${tag}]` : '';
  const who = user ? ` by ${user}` : '';
  return [
    `${timestamp}${label}${who}`,
    `  files: ${files.join(', ')}`,
    `  missing=${summary.missing} extra=${summary.extra} mismatch=${summary.mismatch} total=${summary.total}`,
  ].join('\n');
}

function auditCommand(argv) {
  const auditFile = argv.auditFile || '.envdiff-audit.json';
  const options = {
    since: argv.since || null,
    tag: argv.tag || null,
  };

  let entries = loadAuditLog(auditFile);

  if (entries.length === 0) {
    console.log('No audit entries found.');
    return;
  }

  entries = filterAuditLog(entries, options);

  if (entries.length === 0) {
    console.log('No entries match the given filters.');
    return;
  }

  if (argv.json) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  console.log(`Audit log (${entries.length} entries):\n`);
  entries.forEach((e) => console.log(formatEntry(e) + '\n'));
}

module.exports = { auditCommand };
