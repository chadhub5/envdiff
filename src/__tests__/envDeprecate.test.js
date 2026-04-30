const { buildDeprecationMap, scanDeprecated, suggestMigrations, formatDeprecationReport } = require('../envDeprecate');

const deprecations = {
  OLD_API_KEY: { reason: 'Use new auth system', replacement: 'API_KEY' },
  LEGACY_HOST: { reason: 'Renamed', replacement: 'APP_HOST' },
  REMOVED_FLAG: { reason: 'Feature removed' },
};

describe('buildDeprecationMap', () => {
  it('creates a map with correct entries', () => {
    const map = buildDeprecationMap(deprecations);
    expect(map.has('OLD_API_KEY')).toBe(true);
    expect(map.get('OLD_API_KEY').replacement).toBe('API_KEY');
    expect(map.get('REMOVED_FLAG').replacement).toBeNull();
  });

  it('returns empty map for empty input', () => {
    expect(buildDeprecationMap({}).size).toBe(0);
  });
});

describe('scanDeprecated', () => {
  const map = buildDeprecationMap(deprecations);

  it('detects deprecated keys present in env', () => {
    const env = { OLD_API_KEY: 'abc', APP_HOST: 'localhost', PORT: '3000' };
    const findings = scanDeprecated(env, map);
    expect(findings).toHaveLength(1);
    expect(findings[0].key).toBe('OLD_API_KEY');
    expect(findings[0].replacement).toBe('API_KEY');
  });

  it('returns empty array when no deprecated keys present', () => {
    const env = { API_KEY: 'abc', APP_HOST: 'localhost' };
    expect(scanDeprecated(env, map)).toHaveLength(0);
  });

  it('detects multiple deprecated keys', () => {
    const env = { OLD_API_KEY: 'x', LEGACY_HOST: 'y', REMOVED_FLAG: '1' };
    const findings = scanDeprecated(env, map);
    expect(findings).toHaveLength(3);
  });
});

describe('suggestMigrations', () => {
  const map = buildDeprecationMap(deprecations);

  it('marks replacement as present when it exists in env', () => {
    const env = { OLD_API_KEY: 'x', API_KEY: 'new' };
    const findings = scanDeprecated(env, map);
    const migrations = suggestMigrations(env, findings);
    expect(migrations[0].present).toBe(true);
  });

  it('marks replacement as missing when absent', () => {
    const env = { OLD_API_KEY: 'x' };
    const findings = scanDeprecated(env, map);
    const migrations = suggestMigrations(env, findings);
    expect(migrations[0].present).toBe(false);
  });

  it('skips findings without replacements', () => {
    const env = { REMOVED_FLAG: '1' };
    const findings = scanDeprecated(env, map);
    expect(suggestMigrations(env, findings)).toHaveLength(0);
  });
});

describe('formatDeprecationReport', () => {
  it('returns clean message when no findings', () => {
    expect(formatDeprecationReport([], [])).toBe('No deprecated keys found.');
  });

  it('includes deprecated key info', () => {
    const findings = [{ key: 'OLD_API_KEY', reason: 'Use new auth system', replacement: 'API_KEY' }];
    const migrations = [{ from: 'OLD_API_KEY', to: 'API_KEY', present: false }];
    const report = formatDeprecationReport(findings, migrations);
    expect(report).toContain('OLD_API_KEY');
    expect(report).toContain('replacement missing');
  });
});
