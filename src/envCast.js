/**
 * envCast.js — Infer and cast env variable types from string values
 */

const BOOL_TRUE = new Set(['true', '1', 'yes', 'on']);
const BOOL_FALSE = new Set(['false', '0', 'no', 'off']);

/**
 * Infer the type of a string value.
 * @param {string} value
 * @returns {'boolean'|'number'|'json'|'string'}
 */
function inferType(value) {
  if (BOOL_TRUE.has(value.toLowerCase()) || BOOL_FALSE.has(value.toLowerCase())) {
    return 'boolean';
  }
  if (value !== '' && !isNaN(Number(value))) {
    return 'number';
  }
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) return 'json';
  } catch (_) {}
  return 'string';
}

/**
 * Cast a single string value to its inferred type.
 * @param {string} value
 * @returns {boolean|number|object|string}
 */
function castValue(value) {
  const type = inferType(value);
  switch (type) {
    case 'boolean':
      return BOOL_TRUE.has(value.toLowerCase());
    case 'number':
      return Number(value);
    case 'json':
      return JSON.parse(value);
    default:
      return value;
  }
}

/**
 * Cast all values in an env map.
 * @param {Record<string, string>} env
 * @returns {Record<string, boolean|number|object|string>}
 */
function castEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = castValue(value);
  }
  return result;
}

/**
 * Build a type map for an env object (key -> inferred type string).
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function buildTypeMap(env) {
  const map = {};
  for (const [key, value] of Object.entries(env)) {
    map[key] = inferType(value);
  }
  return map;
}

module.exports = { inferType, castValue, castEnv, buildTypeMap };
