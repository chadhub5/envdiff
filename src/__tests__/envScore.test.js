const { computeScore, scoreToGrade, formatScoreReport } = require('../envScore');

describe('scoreToGrade', () => {
  it('returns A for 90+', () => expect(scoreToGrade(95)).toBe('A'));
  it('returns B for 75-89', () => expect(scoreToGrade(80)).toBe('B'));
  it('returns C for 60-74', () => expect(scoreToGrade(65)).toBe('C'));
  it('returns D for 40-59', () => expect(scoreToGrade(50)).toBe('D'));
  it('returns F below 40', () => expect(scoreToGrade(20)).toBe('F'));
});

describe('computeScore', () => {
  it('returns 100 / A for a clean env', () => {
    const result = computeScore({});
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A');
  });

  it('deducts for missing required keys', () => {
    const result = computeScore({
      validateResult: { missingRequired: ['DB_URL', 'SECRET'] },
    });
    expect(result.score).toBe(70);
    expect(result.breakdown.requiredMissing).toBe(2);
  });

  it('deducts for empty values', () => {
    const result = computeScore({
      validateResult: { emptyValues: ['FOO', 'BAR', 'BAZ'] },
    });
    expect(result.score).toBe(88);
  });

  it('deducts for lint issues', () => {
    const result = computeScore({
      lintResult: {
        namingIssues: ['foo'],
        placeholderIssues: ['bar'],
      },
    });
    expect(result.score).toBe(95);
  });

  it('deducts for missing keys vs reference', () => {
    const result = computeScore({ missingKeys: 4 });
    expect(result.score).toBe(80);
  });

  it('clamps score to 0 minimum', () => {
    const result = computeScore({
      validateResult: {
        missingRequired: Array(10).fill('X'),
        emptyValues: Array(10).fill('Y'),
        duplicates: Array(5).fill('Z'),
      },
      missingKeys: 10,
    });
    expect(result.score).toBe(0);
    expect(result.grade).toBe('F');
  });

  it('includes full breakdown object', () => {
    const result = computeScore({
      validateResult: { duplicates: ['KEY'] },
    });
    expect(result.breakdown).toHaveProperty('duplicateCount', 1);
  });
});

describe('formatScoreReport', () => {
  it('renders a readable report string', () => {
    const result = computeScore({});
    const report = formatScoreReport(result);
    expect(report).toContain('Health Score: 100/100');
    expect(report).toContain('(A)');
    expect(report).toContain('Breakdown:');
  });
});
