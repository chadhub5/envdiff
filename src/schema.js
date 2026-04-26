/**
 * schema.js — Validate env keys against a declared schema (type + required)
 */

/**
 * Parse a schema file (JSON or simple .env-schema format)
 * Schema format: KEY=type[:required]
 * e.g. PORT=number:required
 *      DEBUG=boolean
 *      APP_NAME=string:required
 */
function parseSchema(content) {
  const schema = {};
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    const rest = line.slice(eqIdx + 1).trim();
    const [type = 'string', flag = ''] = rest.split(':');
    schema[key] = { type: type.trim(), required: flag.trim() === 'required' };
  }
  return schema;
}

/**
 * Validate a parsed env object against a schema.
 * Returns array of violation objects.
 */
function validateAgainstSchema(env, schema) {
  const violations = [];

  for (const [key, { type, required }] of Object.entries(schema)) {
    const value = env[key];

    if (value === undefined || value === null) {
      if (required) {
        violations.push({ key, rule: 'missing', message: `Required key "${key}" is missing` });
      }
      continue;
    }

    if (!checkType(value, type)) {
      violations.push({
        key,
        rule: 'type',
        message: `Key "${key}" expected type ${type}, got value "${value}"`
      });
    }
  }

  return violations;
}

function checkType(value, type) {
  switch (type) {
    case 'number': return !isNaN(Number(value)) && value.trim() !== '';
    case 'boolean': return ['true', 'false', '1', '0'].includes(value.trim().toLowerCase());
    case 'url': try { new URL(value); return true; } catch { return false; }
    case 'string': default: return typeof value === 'string';
  }
}

module.exports = { parseSchema, validateAgainstSchema, checkType };
