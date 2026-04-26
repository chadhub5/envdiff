const { parseSchema, validateAgainstSchema, checkType } = require('../schema');

describe('parseSchema', () => {
  it('parses basic schema entries', () => {
    const content = 'PORT=number:required\nDEBUG=boolean\nAPP_NAME=string:required';
    const schema = parseSchema(content);
    expect(schema.PORT).toEqual({ type: 'number', required: true });
    expect(schema.DEBUG).toEqual({ type: 'boolean', required: false });
    expect(schema.APP_NAME).toEqual({ type: 'string', required: true });
  });

  it('skips comments and blank lines', () => {
    const content = '# comment\n\nKEY=string';
    const schema = parseSchema(content);
    expect(Object.keys(schema)).toEqual(['KEY']);
  });

  it('defaults to string type if not specified fully', () => {
    const schema = parseSchema('MYKEY=string');
    expect(schema.MYKEY.type).toBe('string');
  });
});

describe('checkType', () => {
  it('validates numbers', () => {
    expect(checkType('3000', 'number')).toBe(true);
    expect(checkType('abc', 'number')).toBe(false);
    expect(checkType('', 'number')).toBe(false);
  });

  it('validates booleans', () => {
    expect(checkType('true', 'boolean')).toBe(true);
    expect(checkType('0', 'boolean')).toBe(true);
    expect(checkType('yes', 'boolean')).toBe(false);
  });

  it('validates urls', () => {
    expect(checkType('https://example.com', 'url')).toBe(true);
    expect(checkType('not-a-url', 'url')).toBe(false);
  });

  it('accepts any string for type string', () => {
    expect(checkType('anything', 'string')).toBe(true);
  });
});

describe('validateAgainstSchema', () => {
  const schema = {
    PORT: { type: 'number', required: true },
    DEBUG: { type: 'boolean', required: false },
    APP_URL: { type: 'url', required: true }
  };

  it('returns no violations for valid env', () => {
    const env = { PORT: '3000', DEBUG: 'true', APP_URL: 'https://example.com' };
    expect(validateAgainstSchema(env, schema)).toHaveLength(0);
  });

  it('reports missing required keys', () => {
    const env = { DEBUG: 'true' };
    const violations = validateAgainstSchema(env, schema);
    const keys = violations.map(v => v.key);
    expect(keys).toContain('PORT');
    expect(keys).toContain('APP_URL');
  });

  it('does not report missing optional keys', () => {
    const env = { PORT: '8080', APP_URL: 'https://x.com' };
    const violations = validateAgainstSchema(env, schema);
    expect(violations.find(v => v.key === 'DEBUG')).toBeUndefined();
  });

  it('reports type violations', () => {
    const env = { PORT: 'notanumber', DEBUG: 'true', APP_URL: 'https://ok.com' };
    const violations = validateAgainstSchema(env, schema);
    expect(violations[0]).toMatchObject({ key: 'PORT', rule: 'type' });
  });
});
