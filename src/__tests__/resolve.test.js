const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveEnvPaths, getCandidates, labelFromPath, resolveGlob } = require('../resolve');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-resolve-'));
}

describe('getCandidates', () => {
  it('returns absolute path as-is', () => {
    const abs = '/tmp/.env.test';
    expect(getCandidates(abs, '/base')[0]).toBe(abs);
  });

  it('generates multiple candidates for a name', () => {
    const candidates = getCandidates('staging', '/base');
    expect(candidates).toContain('/base/.env.staging');
    expect(candidates).toContain('/base/staging.env');
  });
});

describe('resolveEnvPaths', () => {
  it('resolves an existing .env.<name> file', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, '.env.production'), 'KEY=1');
    const result = resolveEnvPaths(['production'], dir);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('.env.production');
  });

  it('resolves a direct file path', () => {
    const dir = makeTmpDir();
    const file = path.join(dir, 'my.env');
    fs.writeFileSync(file, 'A=1');
    const result = resolveEnvPaths([file], dir);
    expect(result[0]).toBe(path.resolve(file));
  });

  it('throws if no candidate exists', () => {
    const dir = makeTmpDir();
    expect(() => resolveEnvPaths(['nonexistent'], dir)).toThrow('Could not resolve');
  });
});

describe('labelFromPath', () => {
  it('extracts label from .env.production', () => {
    expect(labelFromPath('/some/path/.env.production')).toBe('production');
  });

  it('extracts label from staging.env', () => {
    expect(labelFromPath('/some/path/staging.env')).toBe('staging');
  });

  it('returns default for bare .env', () => {
    expect(labelFromPath('/some/path/.env')).toBe('default');
  });
});

describe('resolveGlob', () => {
  it('finds files matching a glob pattern', async () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, '.env.dev'), 'A=1');
    fs.writeFileSync(path.join(dir, '.env.prod'), 'B=2');
    const results = await resolveGlob('.env.*', dir);
    expect(results.length).toBe(2);
  });

  it('throws when no files match', async () => {
    const dir = makeTmpDir();
    await expect(resolveGlob('*.nothing', dir)).rejects.toThrow('No files matched');
  });
});
