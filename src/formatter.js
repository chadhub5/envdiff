/**
 * Formats diff results for terminal output
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;

/**
 * Format a single diff result object into a human-readable string
 * @param {Object} diffResult - result from diffEnvs()
 * @param {Object} options
 * @param {boolean} options.color - whether to use ANSI colors
 * @returns {string}
 */
function formatDiff(diffResult, options = {}) {
  const { color = true } = options;
  const wrap = (colorName, text) => color ? c(colorName, text) : text;

  const lines = [];

  if (diffResult.missingInB && diffResult.missingInB.length > 0) {
    lines.push(wrap('bold', `Missing in second file (${diffResult.missingInB.length}):`) );
    diffResult.missingInB.forEach(key => {
      lines.push(`  ${wrap('red', '- ' + key)}`);
    });
  }

  if (diffResult.missingInA && diffResult.missingInA.length > 0) {
    lines.push(wrap('bold', `Missing in first file (${diffResult.missingInA.length}):`) );
    diffResult.missingInA.forEach(key => {
      lines.push(`  ${wrap('green', '+ ' + key)}`);
    });
  }

  if (diffResult.mismatched && diffResult.mismatched.length > 0) {
    lines.push(wrap('bold', `Mismatched values (${diffResult.mismatched.length}):`) );
    diffResult.mismatched.forEach(({ key, valueA, valueB }) => {
      lines.push(`  ${wrap('yellow', '~ ' + key)}`);
      lines.push(`    ${wrap('dim', 'a:')} ${valueA}`);
      lines.push(`    ${wrap('dim', 'b:')} ${valueB}`);
    });
  }

  if (lines.length === 0) {
    lines.push(wrap('green', '✓ No differences found'));
  }

  return lines.join('\n');
}

/**
 * Format diff as JSON string
 * @param {Object} diffResult
 * @returns {string}
 */
function formatJson(diffResult) {
  return JSON.stringify(diffResult, null, 2);
}

module.exports = { formatDiff, formatJson };
