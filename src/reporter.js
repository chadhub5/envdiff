/**
 * Reporter module — generates human-readable or machine-readable reports
 * from diff results, supporting multiple output formats.
 */

const { formatDiff, formatJson } = require('./formatter');

const SEVERITY = {
  missing: 'error',
  extra: 'warning',
  mismatch: 'warning',
};

/**
 * Summarize a diff result into counts per category.
 * @param {object} diff
 * @returns {object}
 */
function summarize(diff) {
  return {
    missing: diff.missing ? diff.missing.length : 0,
    extra: diff.extra ? diff.extra.length : 0,
    mismatch: diff.mismatch ? diff.mismatch.length : 0,
    total: (
      (diff.missing ? diff.missing.length : 0) +
      (diff.extra ? diff.extra.length : 0) +
      (diff.mismatch ? diff.mismatch.length : 0)
    ),
  };
}

/**
 * Build a structured report object from a diff result.
 * @param {object} diff
 * @param {object} options
 * @returns {object}
 */
function buildReport(diff, options = {}) {
  const summary = summarize(diff);
  const entries = [];

  (diff.missing || []).forEach((key) => {
    entries.push({ key, type: 'missing', severity: SEVERITY.missing });
  });

  (diff.extra || []).forEach((key) => {
    entries.push({ key, type: 'extra', severity: SEVERITY.extra });
  });

  (diff.mismatch || []).forEach((key) => {
    entries.push({ key, type: 'mismatch', severity: SEVERITY.mismatch });
  });

  return {
    clean: summary.total === 0,
    summary,
    entries,
    generatedAt: options.timestamp ? new Date().toISOString() : undefined,
  };
}

/**
 * Render a report to a string in the requested format.
 * @param {object} report
 * @param {'text'|'json'} format
 * @returns {string}
 */
function renderReport(report, format = 'text') {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  const lines = [];
  lines.push(`Status: ${report.clean ? '✅ clean' : '❌ issues found'}`);
  lines.push(`Summary: ${report.summary.missing} missing, ${report.summary.extra} extra, ${report.summary.mismatch} mismatched`);
  if (report.entries.length > 0) {
    lines.push('');
    report.entries.forEach(({ key, type, severity }) => {
      lines.push(`  [${severity.toUpperCase()}] ${key} — ${type}`);
    });
  }
  if (report.generatedAt) {
    lines.push(`\nGenerated at: ${report.generatedAt}`);
  }
  return lines.join('\n');
}

module.exports = { summarize, buildReport, renderReport };
