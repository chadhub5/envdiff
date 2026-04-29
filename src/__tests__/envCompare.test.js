const { similarityScore, buildComparisonRows, compareSummary } = require('../envCompare');

describe('similarityScore', () => {
  test('identical envs return 1', () => {
    const env = { A: '1', B: '2' };
    expect(similarityScore(env, env)).toBe(1);
  });

  test('completely different keys return 0', () => {
    expect(similarityScore({ A: '1' }, { B: '1' })).toBe(0);
  });

  test('same keys different values return 0', () => {
    expect(similarityScore({ A: '1' }, { A: '2' })).toBe(0);
  });

  test('partial overlap is scored correctly', () => {
    const a = { A: '1', B: '2', C: '3' };
    const b = { A: '1', B: 'X', D: '4' };
    // allKeys = A,B,C,D (4), matches = A only (1)
    expect(similarityScore(a, b)).toBeCloseTo(1 / 4);
  });

  test('empty envs return 1', () => {
    expect(similarityScore({}, {})).toBe(1);
  });
});

describe('buildComparisonRows', () => {
  const envA = { FOO: 'bar', ONLY_A: 'yes' };
  const envB = { FOO: 'baz', ONLY_B: 'yes' };
  const rows = buildComparisonRows(envA, envB, 'left', 'right');

  test('returns a row per unique key', () => {
    expect(rows).toHaveLength(3);
  });

  test('detects mismatch', () => {
    const row = rows.find((r) => r.key === 'FOO');
    expect(row.status).toBe('mismatch');
    expect(row.left).toBe('bar');
    expect(row.right).toBe('baz');
  });

  test('detects missing_right', () => {
    const row = rows.find((r) => r.key === 'ONLY_A');
    expect(row.status).toBe('missing_right');
    expect(row.right).toBeNull();
  });

  test('detects missing_left', () => {
    const row = rows.find((r) => r.key === 'ONLY_B');
    expect(row.status).toBe('missing_left');
    expect(row.left).toBeNull();
  });

  test('keys are sorted alphabetically', () => {
    const keys = rows.map((r) => r.key);
    expect(keys).toEqual([...keys].sort());
  });
});

describe('compareSummary', () => {
  test('counts statuses correctly', () => {
    const rows = [
      { status: 'match' },
      { status: 'match' },
      { status: 'mismatch' },
      { status: 'missing_left' },
      { status: 'missing_right' },
    ];
    const s = compareSummary(rows);
    expect(s.total).toBe(5);
    expect(s.match).toBe(2);
    expect(s.mismatch).toBe(1);
    expect(s.missing_left).toBe(1);
    expect(s.missing_right).toBe(1);
  });

  test('empty rows returns zeros', () => {
    const s = compareSummary([]);
    expect(s.total).toBe(0);
    expect(s.match).toBe(0);
  });
});
