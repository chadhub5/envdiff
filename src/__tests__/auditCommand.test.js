const { auditCommand } = require('../auditCommand');
const { appendAuditEntry, createAuditEntry } = require('../audit');
const fs = require('fs');
const path = require('path');
const os = require('os');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-auditcmd-'));
}

const sampleDiff = [
  { key: 'A', type: 'missing' },
  { key: 'B', type: 'extra' },
];

test('auditCommand prints message when no entries', () => {
  const dir = makeTmpDir();
  const auditFile = path.join(dir, 'empty.json');
  const logs = [];
  jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
  auditCommand({ auditFile });
  expect(logs.some((l) => l.includes('No audit entries found'))).toBe(true);
  console.log.mockRestore();
});

test('auditCommand prints entries in text format', () => {
  const dir = makeTmpDir();
  const auditFile = path.join(dir, 'audit.json');
  appendAuditEntry(createAuditEntry(['.env'], sampleDiff, { tag: 'test' }), auditFile);
  const logs = [];
  jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
  auditCommand({ auditFile });
  const output = logs.join('\n');
  expect(output).toMatch(/missing=1/);
  expect(output).toMatch(/\[test\]/);
  console.log.mockRestore();
});

test('auditCommand prints JSON when --json flag is set', () => {
  const dir = makeTmpDir();
  const auditFile = path.join(dir, 'audit.json');
  appendAuditEntry(createAuditEntry(['.env'], sampleDiff), auditFile);
  const logs = [];
  jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
  auditCommand({ auditFile, json: true });
  const parsed = JSON.parse(logs[0]);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed[0].summary.total).toBe(2);
  console.log.mockRestore();
});

test('auditCommand respects tag filter', () => {
  const dir = makeTmpDir();
  const auditFile = path.join(dir, 'audit.json');
  appendAuditEntry(createAuditEntry(['.env'], sampleDiff, { tag: 'ci' }), auditFile);
  appendAuditEntry(createAuditEntry(['.env'], sampleDiff, { tag: 'manual' }), auditFile);
  const logs = [];
  jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
  auditCommand({ auditFile, tag: 'ci' });
  const output = logs.join('\n');
  expect(output).toMatch(/1 entries/);
  console.log.mockRestore();
});
