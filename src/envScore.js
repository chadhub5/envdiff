/**
 * envScore.js
 * Computes a health score for an env file based on validation, lint, and completeness.
 */

/**
 * @param {object} opts
 * @param {object} opts.validateResult  - result from validateEnv()
 * @param {object} opts.lintResult      - result from lintEnv()
 * @param {number} opts.totalKeys       - total number of keys in the env
 * @param {number} opts.missingKeys     - keys missing vs a reference
 * @returns {{ score: number, grade: string, breakdown: object }}
 */
function computeScore({ validateResult = {}, lintResult = {}, totalKeys = 0, missingKeys = 0 }) {
  let score = 100;

  const emptyCount = (validateResult.emptyValues || []).length;
  const duplicateCount = (validateResult.duplicates || []).length;
  const requiredMissing = (validateResult.missingRequired || []).length;

  const namingIssues = (lintResult.namingIssues || []).length;
  const lengthIssues = (lintResult.lengthIssues || []).length;
  const placeholderIssues = (lintResult.placeholderIssues || []).length;

  score -= requiredMissing * 15;
  score -= missingKeys * 5;
  score -= emptyCount * 4;
  score -= duplicateCount * 6;
  score -= namingIssues * 2;
  score -= lengthIssues * 1;
  score -= placeholderIssues * 3;

  score = Math.max(0, Math.min(100, score));

  const grade = scoreToGrade(score);

  const breakdown = {
    requiredMissing,
    missingKeys,
    emptyCount,
    duplicateCount,
    namingIssues,
    lengthIssues,
    placeholderIssues,
  };

  return { score, grade, breakdown };
}

function scoreToGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function formatScoreReport({ score, grade, breakdown }) {
  const lines = [
    `Health Score: ${score}/100  (${grade})`,
    '',
    'Breakdown:',
    `  Required keys missing : ${breakdown.requiredMissing}`,
    `  Missing vs reference  : ${breakdown.missingKeys}`,
    `  Empty values          : ${breakdown.emptyCount}`,
    `  Duplicate keys        : ${breakdown.duplicateCount}`,
    `  Naming convention     : ${breakdown.namingIssues}`,
    `  Value length issues   : ${breakdown.lengthIssues}`,
    `  Placeholder values    : ${breakdown.placeholderIssues}`,
  ];
  return lines.join('\n');
}

module.exports = { computeScore, scoreToGrade, formatScoreReport };
