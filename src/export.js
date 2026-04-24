const fs = require('fs');
const path = require('path');

/**
 * Export diff results to a file in the specified format.
 * @param {object} report - The report object from buildReport
 * @param {string} outputPath - Destination file path
 * @param {'json'|'dotenv'|'markdown'} format - Output format
 */
function exportReport(report, outputPath, format = 'json') {
  const content = serializeReport(report, format);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, content, 'utf8');
  return outputPath;
}

function serializeReport(report, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(report, null, 2);
    case 'dotenv':
      return toDotenv(report);
    case 'markdown':
      return toMarkdown(report);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function toDotenv(report) {
  const lines = ['# envdiff export', `# Generated: ${new Date().toISOString()}`, ''];
  for (const [key, entry] of Object.entries(report.diff || {})) {
    if (entry.status === 'missing') {
      lines.push(`# MISSING in ${entry.missingIn.join(', ')}`);
      lines.push(`${key}=`);
    } else if (entry.status === 'mismatch') {
      lines.push(`# MISMATCH across envs`);
      lines.push(`${key}=`);
    } else {
      const val = Object.values(entry.values || {})[0] || '';
      lines.push(`${key}=${val}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function toMarkdown(report) {
  const lines = ['# envdiff Report', '', `**Generated:** ${new Date().toISOString()}`, ''];
  const { summary, diff } = report;
  if (summary) {
    lines.push('## Summary', '');
    lines.push(`- Total keys: ${summary.total}`);
    lines.push(`- Missing: ${summary.missing}`);
    lines.push(`- Mismatched: ${summary.mismatched}`);
    lines.push(`- OK: ${summary.ok}`, '');
  }
  if (diff && Object.keys(diff).length > 0) {
    lines.push('## Diff', '', '| Key | Status | Detail |', '|-----|--------|--------|');
    for (const [key, entry] of Object.entries(diff)) {
      const detail = entry.missingIn ? `Missing in: ${entry.missingIn.join(', ')}` : (entry.status === 'mismatch' ? 'Values differ' : '');
      lines.push(`| ${key} | ${entry.status} | ${detail} |`);
    }
  }
  return lines.join('\n');
}

module.exports = { exportReport, serializeReport, toDotenv, toMarkdown };
