const { extractPrefix, groupByPrefix, compareGroups, groupCoverageSummary } = require('../envGroup');

describe('extractPrefix', () => {
  it('returns prefix before first underscore', () => {
    expect(extractPrefix('DB_HOST')).toBe('DB');
    expect(extractPrefix('AWS_SECRET_KEY')).toBe('AWS');
  });

  it('returns __ungrouped__ for keys without underscore', () => {
    expect(extractPrefix('PORT')).toBe('__ungrouped__');
    expect(extractPrefix('NODE')).toBe('__ungrouped__');
  });
});

describe('groupByPrefix', () => {
  it('groups keys by prefix', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432', AWS_KEY: 'abc', PORT: '3000' };
    const groups = groupByPrefix(env);
    expect(groups['DB']).toEqual(['DB_HOST', 'DB_PORT']);
    expect(groups['AWS']).toEqual(['AWS_KEY']);
    expect(groups['__ungrouped__']).toEqual(['PORT']);
  });

  it('returns empty object for empty env', () => {
    expect(groupByPrefix({})).toEqual({});
  });
});

describe('compareGroups', () => {
  const envMap = {
    dev: { DB_HOST: 'localhost', DB_PORT: '5432', AWS_KEY: 'x' },
    prod: { DB_HOST: 'prod-db', DB_PORT: '5432' },
  };

  it('includes all groups from all envs', () => {
    const result = compareGroups(envMap);
    expect(result).toHaveProperty('DB');
    expect(result).toHaveProperty('AWS');
  });

  it('lists keys per env per group', () => {
    const result = compareGroups(envMap);
    expect(result['DB']['dev']).toEqual(['DB_HOST', 'DB_PORT']);
    expect(result['DB']['prod']).toEqual(['DB_HOST', 'DB_PORT']);
    expect(result['AWS']['dev']).toEqual(['AWS_KEY']);
    expect(result['AWS']['prod']).toEqual([]);
  });
});

describe('groupCoverageSummary', () => {
  it('reports groups missing in some envs', () => {
    const groupComparison = {
      DB: { dev: ['DB_HOST'], prod: ['DB_HOST'] },
      AWS: { dev: ['AWS_KEY'], prod: [] },
    };
    const summary = groupCoverageSummary(groupComparison);
    expect(summary).toHaveLength(1);
    expect(summary[0]).toEqual({ group: 'AWS', missingIn: ['prod'] });
  });

  it('returns empty array when all groups are present', () => {
    const groupComparison = {
      DB: { dev: ['DB_HOST'], prod: ['DB_HOST'] },
    };
    expect(groupCoverageSummary(groupComparison)).toEqual([]);
  });
});
