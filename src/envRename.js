/**
 * envRename.js — Detect and suggest key renames across env files
 */

/**
 * Compute Levenshtein distance between two strings
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Compute similarity ratio between two strings (0–1)
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Find candidate renames between two sets of keys.
 * Returns pairs where similarity exceeds threshold.
 * @param {string[]} removedKeys
 * @param {string[]} addedKeys
 * @param {number} threshold
 * @returns {Array<{from: string, to: string, score: number}>}
 */
function findRenameCandiates(removedKeys, addedKeys, threshold = 0.7) {
  const candidates = [];
  for (const from of removedKeys) {
    for (const to of addedKeys) {
      const score = similarity(from, to);
      if (score >= threshold) {
        candidates.push({ from, to, score: Math.round(score * 100) / 100 });
      }
    }
  }
  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * Analyse a diff result and produce rename suggestions.
 * @param {object} diff  Output from diffEnvs()
 * @param {number} threshold
 * @returns {Array<{from: string, to: string, score: number}>}
 */
function suggestRenames(diff, threshold = 0.7) {
  const removed = Object.keys(diff).filter(k => diff[k].status === 'missing_in_second');
  const added   = Object.keys(diff).filter(k => diff[k].status === 'missing_in_first');
  return findRenameCandiates(removed, added, threshold);
}

/**
 * Format rename suggestions as a human-readable string.
 * @param {Array<{from: string, to: string, score: number}>} suggestions
 * @returns {string}
 */
function formatRenameSuggestions(suggestions) {
  if (suggestions.length === 0) return 'No rename suggestions.';
  const lines = ['Possible key renames detected:'];
  for (const { from, to, score } of suggestions) {
    lines.push(`  ${from}  →  ${to}  (similarity: ${(score * 100).toFixed(0)}%)`);
  }
  return lines.join('\n');
}

module.exports = { levenshtein, similarity, findRenameCandiates, suggestRenames, formatRenameSuggestions };
