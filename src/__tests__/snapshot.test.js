const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSnapshot, loadSnapshot, listSnapshots } = require('../snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-snap-'));
}

function writeEnvFile(dir, name, content) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('saveSnapshot', () => {
  it('creates a snapshot JSON file with the parsed keys', () => {
    const tmp = makeTmpDir();
    const envPath = writeEnvFile(tmp, '.env', 'FOO=bar\nBAZ=qux\n');
    const snapDir = path.join(tmp, 'snaps');

    const snapPath = saveSnapshot(envPath, snapDir);
    expect(fs.existsSync(snapPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
    expect(data.source).toBe(envPath);
    expect(data.keys).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(data.capturedAt).toBeDefined();
  });

  it('creates the snapshot directory if it does not exist', () => {
    const tmp = makeTmpDir();
    const envPath = writeEnvFile(tmp, '.env', 'X=1\n');
    const snapDir = path.join(tmp, 'nested', 'snaps');
    saveSnapshot(envPath, snapDir);
    expect(fs.existsSync(snapDir)).toBe(true);
  });
});

describe('loadSnapshot', () => {
  it('loads a previously saved snapshot', () => {
    const tmp = makeTmpDir();
    const envPath = writeEnvFile(tmp, '.env', 'KEY=value\n');
    const snapPath = saveSnapshot(envPath, tmp);
    const data = loadSnapshot(snapPath);
    expect(data.keys).toEqual({ KEY: 'value' });
  });

  it('throws if snapshot file does not exist', () => {
    expect(() => loadSnapshot('/nonexistent/snap.json')).toThrow('Snapshot not found');
  });
});

describe('listSnapshots', () => {
  it('returns empty array when directory does not exist', () => {
    expect(listSnapshots('/no/such/dir')).toEqual([]);
  });

  it('returns snapshot files sorted newest first', () => {
    const tmp = makeTmpDir();
    const envPath = writeEnvFile(tmp, '.env', 'A=1\n');
    const snapDir = path.join(tmp, 'snaps');
    saveSnapshot(envPath, snapDir);
    saveSnapshot(envPath, snapDir);
    const snaps = listSnapshots(snapDir);
    expect(snaps.length).toBe(2);
    expect(snaps[0] >= snaps[1]).toBe(true);
  });
});
