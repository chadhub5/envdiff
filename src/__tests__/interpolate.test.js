const { expandValue, interpolateEnv, findUnresolved } = require('../interpolate');

describe('expandValue', () => {
  it('replaces a simple variable reference', () => {
    expect(expandValue('${HOST}:8080', { HOST: 'localhost' })).toBe('localhost:8080');
  });

  it('uses default when variable is missing', () => {
    expect(expandValue('${HOST:-127.0.0.1}', {})).toBe('127.0.0.1');
  });

  it('prefers actual value over default', () => {
    expect(expandValue('${HOST:-fallback}', { HOST: 'myhost' })).toBe('myhost');
  });

  it('leaves unresolvable references as-is', () => {
    expect(expandValue('${UNKNOWN}', {})).toBe('${UNKNOWN}');
  });

  it('handles multiple references in one value', () => {
    const map = { PROTO: 'https', HOST: 'example.com', PORT: '443' };
    expect(expandValue('${PROTO}://${HOST}:${PORT}', map)).toBe('https://example.com:443');
  });
});

describe('interpolateEnv', () => {
  it('resolves direct references', () => {
    const env = { HOST: 'localhost', URL: 'http://${HOST}/api' };
    const result = interpolateEnv(env);
    expect(result.URL).toBe('http://localhost/api');
  });

  it('resolves chained references', () => {
    const env = { A: 'hello', B: '${A} world', C: '${B}!' };
    const result = interpolateEnv(env);
    expect(result.C).toBe('hello world!');
  });

  it('does not mutate the original map', () => {
    const env = { X: '${Y}', Y: 'val' };
    interpolateEnv(env);
    expect(env.X).toBe('${Y}');
  });

  it('handles env with no references', () => {
    const env = { A: 'foo', B: 'bar' };
    expect(interpolateEnv(env)).toEqual({ A: 'foo', B: 'bar' });
  });
});

describe('findUnresolved', () => {
  it('returns empty array when all references resolve', () => {
    const env = { HOST: 'localhost', URL: 'http://${HOST}' };
    expect(findUnresolved(env)).toEqual([]);
  });

  it('returns entries with unresolved references', () => {
    const env = { URL: 'http://${MISSING_HOST}/path' };
    const result = findUnresolved(env);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('URL');
  });

  it('handles mixed resolved and unresolved', () => {
    const env = { HOST: 'ok', A: '${HOST}', B: '${NOPE}' };
    const result = findUnresolved(env);
    expect(result.map(r => r.key)).toEqual(['B']);
  });
});
