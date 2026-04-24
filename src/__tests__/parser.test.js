const { parseEnvContent, parseEnvFile } = require('../parser');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('parseEnvContent', () => {
  it('parses simple key=value pairs', () => {
    const result = parseEnvContent('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comment lines', () => {
    const result = parseEnvContent('# this is a comment\nFOO=bar');
    expect(result).not.toHaveProperty('#');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('ignores blank lines', () => {
    const result = parseEnvContent('FOO=bar\n\nBAZ=qux\n');
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('handles quoted values', () => {
    const result = parseEnvContent('FOO="hello world"');
    expect(result.FOO).toBe('hello world');
  });

  it('handles single-quoted values', () => {
    const result = parseEnvContent("FOO='hello world'");
    expect(result.FOO).toBe('hello world');
  });

  it('handles keys with no value', () => {
    const result = parseEnvContent('EMPTY=');
    expect(result).toHaveProperty('EMPTY');
    expect(result.EMPTY).toBe('');
  });

  it('trims whitespace around keys and values', () => {
    const result = parseEnvContent('  FOO = bar  ');
    expect(result).toHaveProperty('FOO');
    expect(result.FOO).toBe('bar');
  });
});

describe('parseEnvFile', () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `.env.test.${Date.now()}`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('reads and parses a file from disk', () => {
    fs.writeFileSync(tmpFile, 'KEY=value\nOTHER=123');
    const result = parseEnvFile(tmpFile);
    expect(result).toEqual({ KEY: 'value', OTHER: '123' });
  });

  it('throws if file does not exist', () => {
    expect(() => parseEnvFile('/nonexistent/.env')).toThrow();
  });
});
