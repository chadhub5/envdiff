const fs = require('fs');
const path = require('path');
const os = require('os');
const { stripValues, serializeTemplate, generateTemplate, writeTemplate } = require('../template');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-template-'));
}

describe('stripValues', () => {
  it('replaces all values with empty strings by default', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    expect(stripValues(env)).toEqual({ FOO: '', BAZ: '' });
  });

  it('uses a custom placeholder when provided', () => {
    const env = { FOO: 'bar' };
    expect(stripValues(env, { placeholder: 'CHANGEME' })).toEqual({ FOO: 'CHANGEME' });
  });

  it('keeps values as comments when keepComments is true', () => {
    const env = { FOO: 'bar' };
    const result = stripValues(env, { keepComments: true });
    expect(result.FOO).toBe('# example: bar');
  });

  it('handles empty env object', () => {
    expect(stripValues({})).toEqual({});
  });
});

describe('serializeTemplate', () => {
  it('serializes key=value pairs', () => {
    const template = { FOO: '', BAR: '' };
    const out = serializeTemplate(template);
    expect(out).toContain('FOO=');
    expect(out).toContain('BAR=');
    expect(out.endsWith('\n')).toBe(true);
  });

  it('preserves comment-style values', () => {
    const template = { API_KEY: '# example: abc123' };
    const out = serializeTemplate(template);
    expect(out).toBe('API_KEY=# example: abc123\n');
  });
});

describe('generateTemplate', () => {
  it('merges keys from multiple envs', () => {
    const a = { FOO: '1', SHARED: 'x' };
    const b = { BAR: '2', SHARED: 'y' };
    const result = generateTemplate([a, b]);
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['FOO', 'BAR', 'SHARED']));
  });

  it('strips values in merged result', () => {
    const a = { FOO: 'secret' };
    const result = generateTemplate([a]);
    expect(result.FOO).toBe('');
  });
});

describe('writeTemplate', () => {
  it('writes template file to disk', () => {
    const tmpDir = makeTmpDir();
    const outPath = path.join(tmpDir, '.env.example');
    const template = { FOO: '', BAR: '' };
    writeTemplate(template, outPath);
    const content = fs.readFileSync(outPath, 'utf8');
    expect(content).toContain('FOO=');
    expect(content).toContain('BAR=');
  });
});
