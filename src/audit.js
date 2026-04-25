/**
 * audit.js — Track and record env diff history with timestamps
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_AUDIT_FILE = '.envdiff-audit.json';

/**
 * Create a new audit entry from a diff result
 */
function createAuditEntry(files, diff, options = {}) {
  return {
    timestamp: new Date().toISOString(),
    files: files.map((f) => path.resolve(f)),
    summary: {
      missing: diff.filter((d) => d.type === 'missing').length,
      extra: diff.filter((d) => d.type === 'extra').length,
      mismatch: diff.filter((d) => d.type === 'mismatch').length,
      total: diff.length,
    },
    tag: options.tag || null,
    user: options.user || process.env.USER || null,
  };
}

/**
 * Append an audit entry to the audit log file
 */
function appendAuditEntry(entry, auditFile = DEFAULT_AUDIT_FILE) {
  let entries = [];
  if (fs.existsSync(auditFile)) {
    try {
      entries = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
    } catch {
      entries = [];
    }
  }
  entries.push(entry);
  fs.writeFileSync(auditFile, JSON.stringify(entries, null, 2));
  return entry;
}

/**
 * Load all audit entries from the audit log file
 */
function loadAuditLog(auditFile = DEFAULT_AUDIT_FILE) {
  if (!fs.existsSync(auditFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(auditFile, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Filter audit entries by date range or tag
 */
function filterAuditLog(entries, options = {}) {
  let result = entries;
  if (options.since) {
    const since = new Date(options.since);
    result = result.filter((e) => new Date(e.timestamp) >= since);
  }
  if (options.tag) {
    result = result.filter((e) => e.tag === options.tag);
  }
  return result;
}

module.exports = { createAuditEntry, appendAuditEntry, loadAuditLog, filterAuditLog };
