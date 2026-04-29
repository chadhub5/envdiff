# envdiff group

The `group` command analyzes `.env` files by grouping keys based on their prefix (the part before the first `_`) and compares group coverage across environments.

## Usage

```bash
envdiff group <file1> <file2> [...files]
```

### Options

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON |

## Example

```bash
envdiff group .env.development .env.production
```

### Output

```
Env Key Groups

GROUP           .env.development .env.production
------------------------------------------------
DB              3 key(s)         3 key(s)
AWS             2 key(s)         —
__ungrouped__   1 key(s)         1 key(s)

Coverage Issues:
  [AWS] missing in: .env.production
```

## How Grouping Works

Keys are grouped by the prefix before the first underscore:

- `DB_HOST`, `DB_PORT`, `DB_NAME` → group `DB`
- `AWS_ACCESS_KEY`, `AWS_SECRET` → group `AWS`
- `PORT`, `NODE_ENV` → `PORT` goes to `__ungrouped__`, `NODE_ENV` → group `NODE`

## JSON Output

```bash
envdiff group .env.development .env.production --json
```

Returns a JSON object with:
- `groups`: per-group, per-env key lists
- `summary`: array of groups missing in one or more environments

## Use Cases

- Spot missing service configurations (e.g. no `REDIS_*` keys in production)
- Audit which environments are missing entire feature groups
- Understand the structure of large `.env` files at a glance
