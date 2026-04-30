const { inferType, castValue, castEnv, buildTypeMap } = require('../envCast');

describe('inferType', () => {
  test('detects boolean true variants', () => {
    expect(inferType('true')).toBe('boolean');
    expect(inferType('1')).toBe('boolean');
    expect(inferType('yes')).toBe('boolean');
    expect(inferType('on')).toBe('boolean');
  });

  test('detects boolean false variants', () => {
    expect(inferType('false')).toBe('boolean');
    expect(inferType('0')).toBe('boolean');
    expect(inferType('no')).toBe('boolean');
    expect(inferType('off')).toBe('boolean');
  });

  test('detects numbers', () => {
    expect(inferType('42')).toBe('number');
    expect(inferType('3.14')).toBe('number');
    expect(inferType('-7')).toBe('number');
  });

  test('detects json objects', () => {
    expect(inferType('{"a":1}')).toBe('json');
    expect(inferType('["x","y"]')).toBe('json');
  });

  test('falls back to string', () => {
    expect(inferType('hello')).toBe('string');
    expect(inferType('')).toBe('string');
    expect(inferType('http://example.com')).toBe('string');
  });
});

describe('castValue', () => {
  test('casts booleans correctly', () => {
    expect(castValue('true')).toBe(true);
    expect(castValue('yes')).toBe(true);
    expect(castValue('false')).toBe(false);
    expect(castValue('0')).toBe(false);
  });

  test('casts numbers', () => {
    expect(castValue('42')).toBe(42);
    expect(castValue('3.14')).toBeCloseTo(3.14);
  });

  test('casts JSON', () => {
    expect(castValue('{"x":1}')).toEqual({ x: 1 });
  });

  test('returns string as-is', () => {
    expect(castValue('hello')).toBe('hello');
  });
});

describe('castEnv', () => {
  test('casts all values in an env map', () => {
    const env = { DEBUG: 'true', PORT: '3000', NAME: 'app' };
    const result = castEnv(env);
    expect(result.DEBUG).toBe(true);
    expect(result.PORT).toBe(3000);
    expect(result.NAME).toBe('app');
  });
});

describe('buildTypeMap', () => {
  test('returns correct type for each key', () => {
    const env = { ENABLED: 'yes', WORKERS: '4', LABEL: 'prod' };
    const map = buildTypeMap(env);
    expect(map.ENABLED).toBe('boolean');
    expect(map.WORKERS).toBe('number');
    expect(map.LABEL).toBe('string');
  });
});
