const { checkRequired, checkEmptyValues, checkDuplicates, validateEnv } = require('../validate');

describe('checkRequired', () => {
  it('returns no missing keys when all are present', () => {
    const map = new Map([['DB_HOST', 'localhost'], ['PORT', '3000']]);
    expect(checkRequired(['DB_HOST', 'PORT'], map)).toEqual({ missing: [] });
  });

  it('returns missing keys that are absent from the map', () => {
    const map = new Map([['DB_HOST', 'localhost']]);
    expect(checkRequired(['DB_HOST', 'PORT', 'SECRET'], map)).toEqual({
      missing: ['PORT', 'SECRET'],
    });
  });
});

describe('checkEmptyValues', () => {
  it('detects keys with empty string values', () => {
    const map = new Map([['KEY_A', 'value'], ['KEY_B', ''], ['KEY_C', 'ok']]);
    expect(checkEmptyValues(map)).toEqual({ empty: ['KEY_B'] });
  });

  it('returns empty array when all values are non-empty', () => {
    const map = new Map([['A', '1'], ['B', '2']]);
    expect(checkEmptyValues(map)).toEqual({ empty: [] });
  });
});

describe('checkDuplicates', () => {
  it('detects duplicate keys in raw content', () => {
    const content = 'FOO=bar\nBAZ=qux\nFOO=other';
    expect(checkDuplicates(content)).toEqual({ duplicates: ['FOO'] });
  });

  it('ignores comment lines and blank lines', () => {
    const content = '# comment\nFOO=bar\n\nBAZ=qux';
    expect(checkDuplicates(content)).toEqual({ duplicates: [] });
  });

  it('returns empty array for content with no duplicates', () => {
    const content = 'A=1\nB=2\nC=3';
    expect(checkDuplicates(content)).toEqual({ duplicates: [] });
  });
});

describe('validateEnv', () => {
  it('marks valid when no issues found', () => {
    const content = 'HOST=localhost\nPORT=3000';
    const map = new Map([['HOST', 'localhost'], ['PORT', '3000']]);
    const result = validateEnv(content, map, ['HOST', 'PORT']);
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.duplicates).toEqual([]);
  });

  it('marks invalid when required keys are missing', () => {
    const content = 'HOST=localhost';
    const map = new Map([['HOST', 'localhost']]);
    const result = validateEnv(content, map, ['HOST', 'SECRET']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('SECRET');
  });

  it('includes empty keys in result but does not affect valid flag alone', () => {
    const content = 'HOST=localhost\nSECRET=';
    const map = new Map([['HOST', 'localhost'], ['SECRET', '']]);
    const result = validateEnv(content, map, []);
    expect(result.empty).toContain('SECRET');
    expect(result.valid).toBe(true);
  });
});
