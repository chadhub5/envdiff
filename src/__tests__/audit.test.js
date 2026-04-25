const fs = require('fs');
const path = require('path');
const os = require('os');
const { createAuditEntry, appendAuditEntry, loadAuditLog, filterAuditLog } = require('../audit');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-audit-'));
}

const sampleDiff = [
  { key: 'FOO', type: 'missing' },
  { key: 'BAR', type: 'mismatch' },
  { key: 'BAZ', type: 'extra' },
];

test('createAuditEntry builds correct summary', () => {
  const entry = createAuditEntry(['.env', '.env.prod'], sampleDiff, { tag: 'ci' });
  expect(entry.summary.missing).toBe(1);
  expect(entry.summary.mismatch).toBe(1);
  expect(entry.summary.extra).toBe(1);
  expect(entry.summary.total).toBe(3);
  expect(entry.tag).toBe('ci');
  expect(entry.timestamp).toBeDefined();
});

test('appendAuditEntry creates file and stores entry', () => {
  const dir = makeTmpDir();
  const auditFile = path.join(dir, 'audit.json');
  const entry = createAuditEntry(['.env'], sampleDiff);
  appendAuditEntry(entry, auditFile);
  const loaded = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
  expect(loaded).toHaveLength(1);
  expect(loaded[0].summary.total).toBe(3);
});

test('appendAuditEntry accumulates multiple entries', () => {
  const dir = makeTmpDir();
  const auditFile = path.join(dir, 'audit.json');
  appendAuditEntry(createAuditEntry(['.env'], sampleDiff), auditFile);
  appendAuditEntry(createAuditEntry(['.env.staging'], []), auditFile);
  const loaded = loadAuditLog(auditFile);
  expect(loaded).toHaveLength(2);
});

test('loadAuditLog returns empty array for missing file', () => {
  expect(loadAuditLog('/nonexistent/audit.json')).toEqual([]);
});

test('filterAuditLog filters by tag', () => {
  const entries = [
    { timestamp: '2024-01-01T00:00:00Z', tag: 'ci', summary: {} },
    { timestamp: '2024-01-02T00:00:00Z', tag: 'manual', summary: {} },
  ];
  const result = filterAuditLog(entries, { tag: 'ci' });
  expect(result).toHaveLength(1);
  expect(result[0].tag).toBe('ci');
});

test('filterAuditLog filters by since date', () => {
  const entries = [
    { timestamp: '2024-01-01T00:00:00Z', tag: null, summary: {} },
    { timestamp: '2024-06-01T00:00:00Z', tag: null, summary: {} },
  ];
  const result = filterAuditLog(entries, { since: '2024-03-01' });
  expect(result).toHaveLength(1);
});
