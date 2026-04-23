'use strict';

const { diffEnvs, isClean } = require('../diff');
const { parseEnvContent } = require('../parser');

describe('parseEnvContent', () => {
  it('parses basic key=value pairs', () => {
    const result = parseEnvContent('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comments and blank lines', () => {
    const result = parseEnvContent('# comment\n\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('strips surrounding quotes from values', () => {
    const result = parseEnvContent('FOO="hello world"\nBAR=\'test\'');
    expect(result).toEqual({ FOO: 'hello world', BAR: 'test' });
  });

  it('handles empty values', () => {
    const result = parseEnvContent('FOO=');
    expect(result).toEqual({ FOO: '' });
  });
});

describe('diffEnvs', () => {
  it('returns empty diff for identical envs', () => {
    const env = { FOO: 'bar', BAZ: '123' };
    const result = diffEnvs(env, { ...env });
    expect(isClean(result)).toBe(true);
  });

  it('detects keys missing in B', () => {
    const result = diffEnvs({ FOO: 'bar', EXTRA: 'yes' }, { FOO: 'bar' });
    expect(result.missingInB).toContain('EXTRA');
    expect(result.missingInA).toHaveLength(0);
  });

  it('detects keys missing in A', () => {
    const result = diffEnvs({ FOO: 'bar' }, { FOO: 'bar', EXTRA: 'yes' });
    expect(result.missingInA).toContain('EXTRA');
    expect(result.missingInB).toHaveLength(0);
  });

  it('detects mismatched values', () => {
    const result = diffEnvs({ FOO: 'bar' }, { FOO: 'baz' });
    expect(result.mismatched).toHaveLength(1);
    expect(result.mismatched[0]).toEqual({ key: 'FOO', valueA: 'bar', valueB: 'baz' });
  });

  it('handles completely different envs', () => {
    const result = diffEnvs({ A: '1' }, { B: '2' });
    expect(result.missingInB).toContain('A');
    expect(result.missingInA).toContain('B');
    expect(result.mismatched).toHaveLength(0);
  });
});
