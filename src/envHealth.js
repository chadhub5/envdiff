/**
 * envHealth.js — Computes an overall health assessment for a set of env files.
 * Combines lint, validation, schema, and score results into a single report.
 */

const { lintEnv } = require('./lint');
const { validateEnv } = require('./validate');
const { computeScore, scoreToGrade } = require('./envScore');

const SEVERITY = { error: 2, warning: 1, ok: 0 };

function assessHealth(parsedEnvs, schema = null) {
  const results = {};

  for (const [label, env] of Object.entries(parsedEnvs)) {
    const lintIssues = lintEnv(env);
    const validationIssues = validateEnv(env);

    const errors = [
      ...lintIssues.filter(i => i.severity === 'error'),
      ...validationIssues.filter(i => i.severity === 'error'),
    ];
    const warnings = [
      ...lintIssues.filter(i => i.severity === 'warning'),
      ...validationIssues.filter(i => i.severity === 'warning'),
    ];

    const score = computeScore({ lintIssues, validationIssues, schema, env });
    const grade = scoreToGrade(score);
    const status = errors.length > 0 ? 'unhealthy' : warnings.length > 0 ? 'degraded' : 'healthy';

    results[label] = {
      label,
      status,
      score,
      grade,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
    };
  }

  return results;
}

function formatHealthReport(healthResults, { json = false } = {}) {
  if (json) return JSON.stringify(healthResults, null, 2);

  const lines = [];
  for (const r of Object.values(healthResults)) {
    const icon = r.status === 'healthy' ? '✅' : r.status === 'degraded' ? '⚠️ ' : '❌';
    lines.push(`${icon} [${r.label}] Status: ${r.status} | Grade: ${r.grade} (${r.score}) | Errors: ${r.errorCount} | Warnings: ${r.warningCount}`);
    for (const e of r.errors) lines.push(`   ERROR: ${e.message || e.key}`);
    for (const w of r.warnings) lines.push(`   WARN:  ${w.message || w.key}`);
  }
  return lines.join('\n');
}

function overallStatus(healthResults) {
  const statuses = Object.values(healthResults).map(r => r.status);
  if (statuses.includes('unhealthy')) return 'unhealthy';
  if (statuses.includes('degraded')) return 'degraded';
  return 'healthy';
}

module.exports = { assessHealth, formatHealthReport, overallStatus };
