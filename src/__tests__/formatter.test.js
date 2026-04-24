const { formatDiff, formatJson } = require('../formatter');

const sampleDiff = {
  missingInB: ['DB_HOST', 'SECRET_KEY'],
  missingInA: ['NEW_FEATURE_FLAG'],
  mismatched: [
    { key: 'PORT', valueA: '3000', valueB: '8080' },
  ],
};

describe('formatDiff', () => {
  it('includes missing keys from B section', () => {
    const output = formatDiff(sampleDiff, { color: false });
    expect(output).toContain('Missing in second file');
    expect(output).toContain('- DB_HOST');
    expect(output).toContain('- SECRET_KEY');
  });

  it('includes missing keys from A section', () => {
    const output = formatDiff(sampleDiff, { color: false });
    expect(output).toContain('Missing in first file');
    expect(output).toContain('+ NEW_FEATURE_FLAG');
  });

  it('includes mismatched values with both sides', () => {
    const output = formatDiff(sampleDiff, { color: false });
    expect(output).toContain('Mismatched values');
    expect(output).toContain('~ PORT');
    expect(output).toContain('3000');
    expect(output).toContain('8080');
  });

  it('shows clean message when no differences', () => {
    const clean = { missingInA: [], missingInB: [], mismatched: [] };
    const output = formatDiff(clean, { color: false });
    expect(output).toContain('No differences found');
  });

  it('includes ANSI codes when color is enabled', () => {
    const output = formatDiff(sampleDiff, { color: true });
    expect(output).toContain('\x1b[');
  });

  it('does not include ANSI codes when color is disabled', () => {
    const output = formatDiff(sampleDiff, { color: false });
    expect(output).not.toContain('\x1b[');
  });
});

describe('formatJson', () => {
  it('returns valid JSON string', () => {
    const output = formatJson(sampleDiff);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('contains expected keys in output', () => {
    const parsed = JSON.parse(formatJson(sampleDiff));
    expect(parsed).toHaveProperty('missingInB');
    expect(parsed).toHaveProperty('missingInA');
    expect(parsed).toHaveProperty('mismatched');
  });

  it('is pretty-printed with 2 spaces', () => {
    const output = formatJson(sampleDiff);
    expect(output).toContain('  ');
  });
});
