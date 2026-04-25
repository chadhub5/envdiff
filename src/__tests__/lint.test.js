const { checkNamingConvention, checkValueLength, checkPlaceholderValues, lintEnv } = require('../lint');

describe('checkNamingConvention', () => {
  it('passes for valid UPPER_SNAKE_CASE keys', () => {
    const env = { DATABASE_URL: 'postgres://localhost', API_KEY: 'abc123', PORT: '3000' };
    expect(checkNamingConvention(env)).toEqual([]);
  });

  it('warns for lowercase keys', () => {
    const env = { database_url: 'postgres://localhost' };
    const warnings = checkNamingConvention(env);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].rule).toBe('naming');
    expect(warnings[0].key).toBe('database_url');
  });

  it('warns for camelCase keys', () => {
    const env = { apiKey: 'abc' };
    const warnings = checkNamingConvention(env);
    expect(warnings[0].key).toBe('apiKey');
  });
});

describe('checkValueLength', () => {
  it('passes for short values', () => {
    const env = { KEY: 'short' };
    expect(checkValueLength(env, 200)).toEqual([]);
  });

  it('warns when value exceeds max length', () => {
    const longVal = 'x'.repeat(201);
    const env = { LONG_KEY: longVal };
    const warnings = checkValueLength(env, 200);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].rule).toBe('value-length');
  });

  it('uses custom max length', () => {
    const env = { KEY: 'hello world' };
    const warnings = checkValueLength(env, 5);
    expect(warnings).toHaveLength(1);
  });
});

describe('checkPlaceholderValues', () => {
  it('warns for placeholder values', () => {
    const env = { SECRET: 'changeme', TOKEN: 'todo' };
    const warnings = checkPlaceholderValues(env);
    expect(warnings).toHaveLength(2);
    expect(warnings.map(w => w.rule)).toEqual(['placeholder', 'placeholder']);
  });

  it('is case-insensitive', () => {
    const env = { KEY: 'CHANGEME' };
    const warnings = checkPlaceholderValues(env);
    expect(warnings).toHaveLength(1);
  });

  it('passes for real values', () => {
    const env = { API_KEY: 'sk-real-key-abc123' };
    expect(checkPlaceholderValues(env)).toEqual([]);
  });
});

describe('lintEnv', () => {
  it('returns clean true when no issues', () => {
    const env = { VALID_KEY: 'real-value' };
    const result = lintEnv(env);
    expect(result.clean).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it('aggregates warnings from all rules', () => {
    const env = { badKey: 'changeme' };
    const result = lintEnv(env);
    expect(result.clean).toBe(false);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
  });

  it('respects skipRules option', () => {
    const env = { badKey: 'value' };
    const result = lintEnv(env, { skipRules: ['naming'] });
    const rules = result.warnings.map(w => w.rule);
    expect(rules).not.toContain('naming');
  });
});
