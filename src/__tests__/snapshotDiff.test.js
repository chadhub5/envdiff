const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSnapshot } = require('../snapshot');
const { diffSnapshots, diffAgainstSnapshot, snapshotDiffSummary } = require('../snapshotDiff');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-sdiff-'));
}

function writeEnvFile(dir, name, content) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('diffSnapshots', () => {
  it('detects added, removed, and changed keys between two snapshots', () => {
    const tmp = makeTmpDir();
    const envA = writeEnvFile(tmp, '.env.a', 'FOO=1\nBAR=old\n');
    const envB = writeEnvFile(tmp, '.env.b', 'FOO=1\nBAR=new\nBAZ=3\n');
    const snapA = saveSnapshot(envA, tmp);
    const snapB = saveSnapshot(envB, tmp);

    const result = diffSnapshots(snapA, snapB);
    expect(result.added).toContain('BAZ');
    expect(result.changed).toContain('BAR');
    expect(result.removed).not.toContain('FOO');
  });
});

describe('diffAgainstSnapshot', () => {
  it('compares a live env object against a snapshot', () => {
    const tmp = makeTmpDir();
    const envPath = writeEnvFile(tmp, '.env', 'FOO=1\nBAR=2\n');
    const snapPath = saveSnapshot(envPath, tmp);

    const liveEnv = { FOO: '1', BAR: '99', EXTRA: 'yes' };
    const result = diffAgainstSnapshot(liveEnv, snapPath);
    expect(result.changed).toContain('BAR');
    expect(result.added).toContain('EXTRA');
  });
});

describe('snapshotDiffSummary', () => {
  it('returns a string summary with added/removed/changed sections', () => {
    const tmp = makeTmpDir();
    const envA = writeEnvFile(tmp, '.env.a', 'FOO=1\nDEL=gone\n');
    const envB = writeEnvFile(tmp, '.env.b', 'FOO=2\nNEW=here\n');
    const snapA = saveSnapshot(envA, tmp);
    const snapB = saveSnapshot(envB, tmp);

    const summary = snapshotDiffSummary(snapA, snapB);
    expect(summary).toMatch(/Changed keys/);
    expect(summary).toMatch(/Added keys/);
    expect(summary).toMatch(/Removed keys/);
    expect(summary).toMatch(/FOO/);
    expect(summary).toMatch(/NEW/);
    expect(summary).toMatch(/DEL/);
  });

  it('reports no differences when snapshots are identical', () => {
    const tmp = makeTmpDir();
    const envPath = writeEnvFile(tmp, '.env', 'A=1\n');
    const snapA = saveSnapshot(envPath, tmp);
    const snapB = saveSnapshot(envPath, tmp);
    const summary = snapshotDiffSummary(snapA, snapB);
    expect(summary).toMatch(/No differences found/);
  });
});
