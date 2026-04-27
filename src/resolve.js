/**
 * resolve.js — Resolves env file paths from named environments or globs
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Given a list of env identifiers (file paths or env names like "production"),
 * return resolved absolute file paths that exist on disk.
 */
function resolveEnvPaths(inputs, baseDir = process.cwd()) {
  const resolved = [];
  for (const input of inputs) {
    const candidates = getCandidates(input, baseDir);
    const found = candidates.find((c) => fs.existsSync(c));
    if (found) {
      resolved.push(path.resolve(found));
    } else {
      throw new Error(`Could not resolve env file for: "${input}"`);
    }
  }
  return resolved;
}

/**
 * Generate candidate file paths for a given input string.
 * Supports: direct paths, .env.<name>, .env_<name>, <name>.env
 */
function getCandidates(input, baseDir) {
  if (path.isAbsolute(input)) return [input];
  return [
    path.join(baseDir, input),
    path.join(baseDir, `.env.${input}`),
    path.join(baseDir, `.env_${input}`),
    path.join(baseDir, `${input}.env`),
    path.join(baseDir, `envs/.env.${input}`),
    path.join(baseDir, `config/.env.${input}`),
  ];
}

/**
 * Expand glob patterns to a list of matching env files.
 */
async function resolveGlob(pattern, baseDir = process.cwd()) {
  const matches = await glob(pattern, { cwd: baseDir, absolute: true });
  if (!matches.length) {
    throw new Error(`No files matched glob pattern: "${pattern}"`);
  }
  return matches.sort();
}

/**
 * Derive a short label (e.g. "production") from a resolved file path.
 */
function labelFromPath(filePath) {
  const base = path.basename(filePath);
  // .env.production -> production, production.env -> production, .env -> default
  return base
    .replace(/^\.env[._-]?/, '')
    .replace(/\.env$/, '')
    .replace(/^_/, '')
    || 'default';
}

module.exports = { resolveEnvPaths, getCandidates, resolveGlob, labelFromPath };
