const { assessHealth, formatHealthReport, overallStatus } = require('../envHealth');

const cleanEnv = {
  DATABASE_URL: 'postgres://localhost/db',
  API_KEY: 'abc123',
  PORT: '3000',
};

const dirtyEnv = {
  database_url: '',          // bad naming + empty value
  'INVALID KEY': 'x',       // bad key
  PLACEHOLDER: 'CHANGE_ME', // placeholder
};

describe('assessHealth', () => {
  it('returns healthy for a clean env', () => {
    const results = assessHealth({ production: cleanEnv });
    expect(results.production).toBeDefined();
    expect(results.production.status).toBe('healthy');
    expect(results.production.errorCount).toBe(0);
  });

  it('returns unhealthy or degraded for a dirty env', () => {
    const results = assessHealth({ staging: dirtyEnv });
    expect(results.staging).toBeDefined();
    expect(['unhealthy', 'degraded']).toContain(results.staging.status);
    expect(results.staging.errorCount + results.staging.warningCount).toBeGreaterThan(0);
  });

  it('includes score and grade', () => {
    const results = assessHealth({ production: cleanEnv });
    expect(typeof results.production.score).toBe('number');
    expect(typeof results.production.grade).toBe('string');
  });

  it('handles multiple envs', () => {
    const results = assessHealth({ production: cleanEnv, staging: dirtyEnv });
    expect(Object.keys(results)).toHaveLength(2);
  });
});

describe('formatHealthReport', () => {
  it('returns a non-empty string', () => {
    const results = assessHealth({ production: cleanEnv });
    const report = formatHealthReport(results);
    expect(typeof report).toBe('string');
    expect(report.length).toBeGreaterThan(0);
    expect(report).toContain('production');
  });

  it('returns valid JSON when json=true', () => {
    const results = assessHealth({ production: cleanEnv });
    const json = formatHealthReport(results, { json: true });
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes status icon in text output', () => {
    const results = assessHealth({ production: cleanEnv });
    const report = formatHealthReport(results);
    expect(report).toMatch(/✅|⚠️|❌/);
  });
});

describe('overallStatus', () => {
  it('returns healthy when all envs are healthy', () => {
    const results = assessHealth({ production: cleanEnv });
    expect(overallStatus(results)).toBe('healthy');
  });

  it('returns unhealthy when any env is unhealthy', () => {
    const results = assessHealth({ production: cleanEnv, staging: dirtyEnv });
    const status = overallStatus(results);
    expect(['unhealthy', 'degraded']).toContain(status);
  });
});
