'use strict';

const {
  detectDrift,
  detectDropped,
  detectAdded,
  buildDriftReport,
  formatDriftReport,
} = require('../envDrift');

const base = { HOST: 'localhost', PORT: '3000', DB: 'mydb', SECRET: 'abc' };
const updated = { HOST: 'prod.example.com', PORT: '3000', SECRET: 'xyz', NEW_KEY: '1' };

describe('detectDrift', () => {
  it('returns keys with changed values', () => {
    const result = detectDrift(base, updated);
    expect(result).toEqual(expect.arrayContaining([
      { key: 'HOST', before: 'localhost', after: 'prod.example.com' },
      { key: 'SECRET', before: 'abc', after: 'xyz' },
    ]));
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no values changed', () => {
    expect(detectDrift({ A: '1' }, { A: '1' })).toEqual([]);
  });

  it('ignores keys only in after', () => {
    const result = detectDrift({ A: '1' }, { A: '1', B: '2' });
    expect(result).toEqual([]);
  });
});

describe('detectDropped', () => {
  it('finds keys removed in after', () => {
    expect(detectDropped(base, updated)).toContain('DB');
  });

  it('returns empty when nothing dropped', () => {
    expect(detectDropped({ A: '1' }, { A: '1', B: '2' })).toEqual([]);
  });
});

describe('detectAdded', () => {
  it('finds keys added in after', () => {
    expect(detectAdded(base, updated)).toContain('NEW_KEY');
  });

  it('returns empty when nothing added', () => {
    expect(detectAdded({ A: '1', B: '2' }, { A: '1' })).toEqual([]);
  });
});

describe('buildDriftReport', () => {
  it('builds a complete report', () => {
    const report = buildDriftReport(base, updated, { before: 'v1', after: 'v2' });
    expect(report.driftCount).toBe(2);
    expect(report.dropped).toContain('DB');
    expect(report.added).toContain('NEW_KEY');
    expect(report.clean).toBe(false);
    expect(report.labels).toEqual({ before: 'v1', after: 'v2' });
  });

  it('marks clean when envs are identical', () => {
    const report = buildDriftReport({ A: '1' }, { A: '1' });
    expect(report.clean).toBe(true);
  });
});

describe('formatDriftReport', () => {
  it('includes summary lines', () => {
    const report = buildDriftReport(base, updated, { before: 'snap1', after: 'snap2' });
    const text = formatDriftReport(report);
    expect(text).toMatch('snap1 → snap2');
    expect(text).toMatch('Value changes');
    expect(text).toMatch('HOST');
    expect(text).toMatch('Dropped keys');
    expect(text).toMatch('Added keys');
  });

  it('says no drift when clean', () => {
    const report = buildDriftReport({ A: '1' }, { A: '1' });
    expect(formatDriftReport(report)).toMatch('No drift detected');
  });
});
