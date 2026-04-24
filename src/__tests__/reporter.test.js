const { summarize, buildReport, renderReport } = require('../reporter');

const sampleDiff = {
  missing: ['DB_HOST', 'API_KEY'],
  extra: ['OLD_FLAG'],
  mismatch: ['PORT'],
};

const cleanDiff = {
  missing: [],
  extra: [],
  mismatch: [],
};

describe('summarize', () => {
  test('counts each category correctly', () => {
    const s = summarize(sampleDiff);
    expect(s.missing).toBe(2);
    expect(s.extra).toBe(1);
    expect(s.mismatch).toBe(1);
    expect(s.total).toBe(4);
  });

  test('returns zeros for a clean diff', () => {
    const s = summarize(cleanDiff);
    expect(s.total).toBe(0);
  });
});

describe('buildReport', () => {
  test('marks clean=false when there are issues', () => {
    const report = buildReport(sampleDiff);
    expect(report.clean).toBe(false);
  });

  test('marks clean=true for a clean diff', () => {
    const report = buildReport(cleanDiff);
    expect(report.clean).toBe(true);
  });

  test('entries contain correct types', () => {
    const report = buildReport(sampleDiff);
    const types = report.entries.map((e) => e.type);
    expect(types).toContain('missing');
    expect(types).toContain('extra');
    expect(types).toContain('mismatch');
  });

  test('includes generatedAt when timestamp option is set', () => {
    const report = buildReport(sampleDiff, { timestamp: true });
    expect(report.generatedAt).toBeDefined();
  });

  test('omits generatedAt by default', () => {
    const report = buildReport(sampleDiff);
    expect(report.generatedAt).toBeUndefined();
  });
});

describe('renderReport', () => {
  test('text format contains status line', () => {
    const report = buildReport(sampleDiff);
    const output = renderReport(report, 'text');
    expect(output).toContain('Status:');
    expect(output).toContain('issues found');
  });

  test('json format is valid JSON', () => {
    const report = buildReport(sampleDiff);
    const output = renderReport(report, 'json');
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('text format lists individual entries', () => {
    const report = buildReport(sampleDiff);
    const output = renderReport(report, 'text');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('OLD_FLAG');
  });
});
