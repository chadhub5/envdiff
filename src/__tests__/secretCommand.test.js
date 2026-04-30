const { formatFindings } = require('../secretCommand');

describe('formatFindings', () => {
  it('returns success message when no findings', () => {
    expect(formatFindings([])).toContain('No secrets detected');
  });

  it('lists findings with key and reason tags', () => {
    const findings = [
      { key: 'DB_PASSWORD', reason: 'sensitive_key', byKey: true, byValue: null },
      { key: 'TOKEN', reason: 'high_entropy', byKey: true, byValue: 'high_entropy' },
    ];
    const output = formatFindings(findings);
    expect(output).toContain('DB_PASSWORD');
    expect(output).toContain('sensitive-key');
    expect(output).toContain('TOKEN');
    expect(output).toContain('value:high_entropy');
  });

  it('shows count in header', () => {
    const findings = [{ key: 'X', reason: 'jwt', byKey: false, byValue: 'jwt' }];
    expect(formatFindings(findings)).toContain('1 potential secret');
  });

  it('includes both tags when key and value both match', () => {
    const findings = [{ key: 'API_KEY', reason: 'api_key', byKey: true, byValue: 'api_key' }];
    const out = formatFindings(findings);
    expect(out).toContain('sensitive-key');
    expect(out).toContain('value:api_key');
  });
});
