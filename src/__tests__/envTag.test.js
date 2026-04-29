const {
  buildTagIndex,
  annotateEnv,
  filterByTag,
  tagCoverageSummary,
  formatTagReport,
} = require('../envTag');

describe('buildTagIndex', () => {
  test('inverts tag map to key index', () => {
    const tagMap = { auth: ['JWT_SECRET', 'API_KEY'], db: ['DB_HOST', 'DB_PASS'] };
    const index = buildTagIndex(tagMap);
    expect(index['JWT_SECRET']).toEqual(['auth']);
    expect(index['DB_HOST']).toEqual(['db']);
  });

  test('a key can have multiple tags', () => {
    const tagMap = { auth: ['SHARED_KEY'], infra: ['SHARED_KEY'] };
    const index = buildTagIndex(tagMap);
    expect(index['SHARED_KEY']).toEqual(['auth', 'infra']);
  });

  test('returns empty index for empty map', () => {
    expect(buildTagIndex({})).toEqual({});
  });
});

describe('annotateEnv', () => {
  test('adds tags array to each key', () => {
    const env = { JWT_SECRET: 'abc', PORT: '3000' };
    const index = { JWT_SECRET: ['auth'] };
    const result = annotateEnv(env, index);
    expect(result).toContainEqual({ key: 'JWT_SECRET', value: 'abc', tags: ['auth'] });
    expect(result).toContainEqual({ key: 'PORT', value: '3000', tags: [] });
  });
});

describe('filterByTag', () => {
  test('returns only entries with matching tag', () => {
    const annotated = [
      { key: 'A', value: '1', tags: ['auth'] },
      { key: 'B', value: '2', tags: ['db'] },
      { key: 'C', value: '3', tags: ['auth', 'db'] },
    ];
    const result = filterByTag(annotated, 'auth');
    expect(result.map((e) => e.key)).toEqual(['A', 'C']);
  });

  test('returns empty array when no match', () => {
    const annotated = [{ key: 'X', value: 'y', tags: [] }];
    expect(filterByTag(annotated, 'auth')).toEqual([]);
  });
});

describe('tagCoverageSummary', () => {
  test('counts keys per tag and untagged', () => {
    const env = { A: '1', B: '2', C: '3' };
    const index = { A: ['auth'], B: ['auth', 'db'] };
    const summary = tagCoverageSummary(env, index);
    expect(summary.tagCounts.auth).toBe(2);
    expect(summary.tagCounts.db).toBe(1);
    expect(summary.untagged).toBe(1);
    expect(summary.total).toBe(3);
  });
});

describe('formatTagReport', () => {
  test('includes tag counts and untagged', () => {
    const summary = { tagCounts: { auth: 2, db: 1 }, untagged: 3, total: 6 };
    const report = formatTagReport(summary);
    expect(report).toContain('[auth] 2 key(s)');
    expect(report).toContain('[db] 1 key(s)');
    expect(report).toContain('[untagged] 3 key(s)');
    expect(report).toContain('6 keys total');
  });

  test('omits untagged line when all keys are tagged', () => {
    const summary = { tagCounts: { auth: 2 }, untagged: 0, total: 2 };
    const report = formatTagReport(summary);
    expect(report).not.toContain('untagged');
  });
});
