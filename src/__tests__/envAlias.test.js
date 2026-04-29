const { buildAliasMap, resolveAliases, detectStaleAliases, formatAliasReport } = require('../envAlias');

describe('buildAliasMap', () => {
  it('creates a map from plain object', () => {
    const map = buildAliasMap({ OLD_KEY: 'NEW_KEY', FOO: 'BAR' });
    expect(map.get('OLD_KEY')).toBe('NEW_KEY');
    expect(map.get('FOO')).toBe('BAR');
  });

  it('ignores non-string values', () => {
    const map = buildAliasMap({ BAD: 123, GOOD: 'OK' });
    expect(map.has('BAD')).toBe(false);
    expect(map.get('GOOD')).toBe('OK');
  });

  it('returns empty map for empty input', () => {
    expect(buildAliasMap().size).toBe(0);
  });
});

describe('resolveAliases', () => {
  it('renames old key to new key', () => {
    const map = buildAliasMap({ OLD_DB: 'DATABASE_URL' });
    const { resolved, applied } = resolveAliases({ OLD_DB: 'postgres://localhost' }, map);
    expect(resolved.DATABASE_URL).toBe('postgres://localhost');
    expect(resolved.OLD_DB).toBeUndefined();
    expect(applied).toEqual([{ from: 'OLD_DB', to: 'DATABASE_URL' }]);
  });

  it('does not overwrite existing canonical key', () => {
    const map = buildAliasMap({ OLD_DB: 'DATABASE_URL' });
    const env = { OLD_DB: 'old-val', DATABASE_URL: 'real-val' };
    const { resolved, applied } = resolveAliases(env, map);
    expect(resolved.DATABASE_URL).toBe('real-val');
    expect(resolved.OLD_DB).toBeUndefined();
    expect(applied).toHaveLength(0);
  });

  it('leaves env unchanged when no alias matches', () => {
    const map = buildAliasMap({ X: 'Y' });
    const { resolved, applied } = resolveAliases({ A: '1' }, map);
    expect(resolved).toEqual({ A: '1' });
    expect(applied).toHaveLength(0);
  });
});

describe('detectStaleAliases', () => {
  it('detects when old key present but new key missing', () => {
    const map = buildAliasMap({ OLD_KEY: 'NEW_KEY' });
    const stale = detectStaleAliases({ OLD_KEY: 'val' }, map);
    expect(stale).toEqual([{ from: 'OLD_KEY', to: 'NEW_KEY' }]);
  });

  it('returns empty when both keys present', () => {
    const map = buildAliasMap({ OLD_KEY: 'NEW_KEY' });
    expect(detectStaleAliases({ OLD_KEY: 'v', NEW_KEY: 'v2' }, map)).toHaveLength(0);
  });

  it('returns empty when neither key present', () => {
    const map = buildAliasMap({ OLD_KEY: 'NEW_KEY' });
    expect(detectStaleAliases({ OTHER: 'x' }, map)).toHaveLength(0);
  });
});

describe('formatAliasReport', () => {
  it('shows resolved aliases', () => {
    const out = formatAliasReport([{ from: 'A', to: 'B' }], []);
    expect(out).toContain('A → B');
    expect(out).toContain('Aliases resolved');
  });

  it('shows stale aliases', () => {
    const out = formatAliasReport([], [{ from: 'OLD', to: 'NEW' }]);
    expect(out).toContain('MISSING TARGET');
    expect(out).toContain('OLD → NEW');
  });

  it('shows no changes message when both empty', () => {
    expect(formatAliasReport([], [])).toContain('No alias changes detected.');
  });
});
