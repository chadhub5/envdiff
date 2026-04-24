const { mergeEnvs, mergeSummary, findSource } = require('../merge');

describe('mergeEnvs', () => {
  it('merges non-overlapping keys from multiple envs', () => {
    const envs = [
      { name: 'base', data: { A: '1', B: '2' } },
      { name: 'prod', data: { C: '3' } },
    ];
    const { merged, conflicts } = mergeEnvs(envs);
    expect(merged).toEqual({ A: '1', B: '2', C: '3' });
    expect(conflicts).toEqual({});
  });

  it('later env overrides earlier for same key', () => {
    const envs = [
      { name: 'base', data: { A: 'old' } },
      { name: 'prod', data: { A: 'new' } },
    ];
    const { merged } = mergeEnvs(envs);
    expect(merged.A).toBe('new');
  });

  it('records conflicts when values differ', () => {
    const envs = [
      { name: 'base', data: { DB_URL: 'localhost' } },
      { name: 'prod', data: { DB_URL: 'prod-host' } },
    ];
    const { conflicts } = mergeEnvs(envs);
    expect(conflicts).toHaveProperty('DB_URL');
    expect(conflicts.DB_URL).toHaveLength(2);
    expect(conflicts.DB_URL[0].source).toBe('base');
    expect(conflicts.DB_URL[1].source).toBe('prod');
  });

  it('does not record conflict when values are identical', () => {
    const envs = [
      { name: 'base', data: { KEY: 'same' } },
      { name: 'prod', data: { KEY: 'same' } },
    ];
    const { conflicts } = mergeEnvs(envs);
    expect(conflicts).toEqual({});
  });

  it('handles empty env objects', () => {
    const { merged, conflicts } = mergeEnvs([]);
    expect(merged).toEqual({});
    expect(conflicts).toEqual({});
  });
});

describe('mergeSummary', () => {
  it('returns correct totals with no conflicts', () => {
    const result = { merged: { A: '1', B: '2' }, conflicts: {} };
    const summary = mergeSummary(result);
    expect(summary.totalKeys).toBe(2);
    expect(summary.conflictCount).toBe(0);
    expect(summary.hasConflicts).toBe(false);
  });

  it('flags hasConflicts when conflicts exist', () => {
    const result = { merged: { A: '1' }, conflicts: { A: [] } };
    const summary = mergeSummary(result);
    expect(summary.hasConflicts).toBe(true);
    expect(summary.conflictKeys).toContain('A');
  });
});

describe('findSource', () => {
  it('finds the source that owns a key/value pair', () => {
    const envs = [
      { name: 'base', data: { X: 'hello' } },
      { name: 'prod', data: { X: 'world' } },
    ];
    expect(findSource(envs, 'X', 'hello')).toBe('base');
    expect(findSource(envs, 'X', 'world')).toBe('prod');
  });

  it('returns unknown when not found', () => {
    expect(findSource([], 'X', 'val')).toBe('unknown');
  });
});
