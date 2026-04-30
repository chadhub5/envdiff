/**
 * envSecret.js — Detect and classify secrets/sensitive values in env files
 */

const SECRET_PATTERNS = [
  { name: 'high_entropy', test: (v) => entropy(v) > 4.5 && v.length >= 16 },
  { name: 'api_key', test: (v) => /^[A-Za-z0-9_\-]{20,}$/.test(v) },
  { name: 'jwt', test: (v) => /^eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/.test(v) },
  { name: 'url_with_creds', test: (v) => /:\/\/[^:]+:[^@]+@/.test(v) },
  { name: 'private_key', test: (v) => v.includes('BEGIN') && v.includes('PRIVATE') },
];

const SENSITIVE_KEY_PATTERNS = [
  /secret/i, /password/i, /passwd/i, /token/i, /api[_-]?key/i,
  /auth/i, /credential/i, /private[_-]?key/i, /access[_-]?key/i,
];

function entropy(str) {
  const freq = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  return Object.values(freq).reduce((sum, c) => {
    const p = c / str.length;
    return sum - p * Math.log2(p);
  }, 0);
}

function classifyValue(value) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(value)) return pattern.name;
  }
  return null;
}

function isSensitiveKey(key) {
  return SENSITIVE_KEY_PATTERNS.some((p) => p.test(key));
}

function scanSecrets(env) {
  const findings = [];
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    const byKey = isSensitiveKey(key);
    const byValue = classifyValue(value);
    if (byKey || byValue) {
      findings.push({ key, reason: byValue || 'sensitive_key', byKey, byValue });
    }
  }
  return findings;
}

function secretSummary(findings) {
  return {
    total: findings.length,
    byReason: findings.reduce((acc, f) => {
      acc[f.reason] = (acc[f.reason] || 0) + 1;
      return acc;
    }, {}),
    keys: findings.map((f) => f.key),
  };
}

module.exports = { entropy, classifyValue, isSensitiveKey, scanSecrets, secretSummary };
