const {
  levenshtein,
  similarity,
  findRenameCandiates,
  suggestRenames,
  formatRenameSuggestions,
} = require('../envRename');

describe('levenshtein', () => {
  test('identical strings', () => expect(levenshtein('abc', 'abc')).toBe(0));
  test('empty strings', () => expect(levenshtein('', '')).toBe(0));
  test('insertions', () => expect(levenshtein('cat', 'cats')).toBe(1));
  test('substitutions', () => expect(levenshtein('kitten', 'sitten')).toBe(1));
  test('completely different', () => expect(levenshtein('abc', 'xyz')).toBe(3));
});

describe('similarity', () => {
  test('identical returns 1', () => expect(similarity('DB_HOST', 'DB_HOST')).toBe(1));
  test('empty strings return 1', () => expect(similarity('', '')).toBe(1));
  test('similar keys have high score', () => {
    expect(similarity('DB_PASSWORD', 'DB_PASSWD')).toBeGreaterThan(0.7);
  });
  test('unrelated keys have low score', () => {
    expect(similarity('API_KEY', 'DATABASE_URL')).toBeLessThan(0.5);
  });
});

describe('findRenameCandiates', () => {
  test('finds obvious rename', () => {
    const result = findRenameCandiates(['DB_PASS'], ['DB_PASSWORD']);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].from).toBe('DB_PASS');
    expect(result[0].to).toBe('DB_PASSWORD');
  });

  test('returns empty when no match above threshold', () => {
    const result = findRenameCandiates(['FOO'], ['ZZZZZZZ'], 0.9);
    expect(result).toHaveLength(0);
  });

  test('results sorted by score descending', () => {
    const result = findRenameCandiates(['DB_PASS'], ['DB_PASSWORD', 'DB_PASSWD']);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });
});

describe('suggestRenames', () => {
  test('suggests renames from diff', () => {
    const diff = {
      DB_PASS: { status: 'missing_in_second' },
      DB_PASSWORD: { status: 'missing_in_first' },
      SHARED: { status: 'match' },
    };
    const suggestions = suggestRenames(diff, 0.7);
    expect(suggestions.some(s => s.from === 'DB_PASS' && s.to === 'DB_PASSWORD')).toBe(true);
  });

  test('returns empty array when no candidates', () => {
    const diff = { FOO: { status: 'match' } };
    expect(suggestRenames(diff)).toHaveLength(0);
  });
});

describe('formatRenameSuggestions', () => {
  test('returns message when no suggestions', () => {
    expect(formatRenameSuggestions([])).toBe('No rename suggestions.');
  });

  test('formats suggestions correctly', () => {
    const result = formatRenameSuggestions([{ from: 'OLD_KEY', to: 'NEW_KEY', score: 0.85 }]);
    expect(result).toContain('OLD_KEY');
    expect(result).toContain('NEW_KEY');
    expect(result).toContain('85%');
  });
});
