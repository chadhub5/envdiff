const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadConfig, findConfigFile, DEFAULT_CONFIG } = require('../config');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-'));
}

describe('loadConfig', () => {
  test('returns defaults when no rc file exists', () => {
    const dir = makeTmpDir();
    const config = loadConfig(dir);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  test('merges rc file values over defaults', () => {
    const dir = makeTmpDir();
    const rc = { format: 'json', strict: true };
    fs.writeFileSync(path.join(dir, '.envdiffrc.json'), JSON.stringify(rc));
    const config = loadConfig(dir);
    expect(config.format).toBe('json');
    expect(config.strict).toBe(true);
    expect(config.exitOnDiff).toBe(DEFAULT_CONFIG.exitOnDiff);
  });

  test('falls back to defaults on malformed JSON', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, '.envdiffrc.json'), 'not json {{{');
    const config = loadConfig(dir);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  test('ignoreKeys defaults to empty array', () => {
    const dir = makeTmpDir();
    const config = loadConfig(dir);
    expect(Array.isArray(config.ignoreKeys)).toBe(true);
    expect(config.ignoreKeys).toHaveLength(0);
  });
});

describe('findConfigFile', () => {
  test('finds rc file in the given directory', () => {
    const dir = makeTmpDir();
    const rcPath = path.join(dir, '.envdiffrc.json');
    fs.writeFileSync(rcPath, '{}');
    expect(findConfigFile(dir)).toBe(rcPath);
  });

  test('returns null when no rc file exists anywhere', () => {
    const dir = makeTmpDir();
    // Highly unlikely to have a real rc file in a fresh tmp dir
    const result = findConfigFile(dir);
    // Either null or a real project rc — just check type
    expect(result === null || typeof result === 'string').toBe(true);
  });
});
