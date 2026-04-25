# Audit Log

The `audit` feature records every diff run into a local audit log, giving you a history of environment changes over time.

## How it works

When you run `envdiff` with the `--audit` flag, each comparison is appended to `.envdiff-audit.json` in the current directory.

```bash
envdiff .env .env.production --audit
envdiff .env .env.production --audit --tag ci
```

Each entry records:
- **timestamp** — ISO 8601 date/time of the comparison
- **files** — absolute paths of compared files
- **summary** — counts of missing, extra, and mismatched keys
- **tag** — optional label (e.g. `ci`, `release`)
- **user** — current OS user (`$USER`)

## Viewing the audit log

```bash
# Print all entries
envdiff audit

# Filter by tag
envdiff audit --tag ci

# Filter by date
envdiff audit --since 2024-06-01

# Output as JSON
envdiff audit --json
```

## Custom audit file

```bash
envdiff audit --audit-file /var/log/envdiff-audit.json
```

## Programmatic usage

```js
const { createAuditEntry, appendAuditEntry, loadAuditLog } = require('envdiff/src/audit');

const entry = createAuditEntry(['.env', '.env.prod'], diffResult, { tag: 'deploy' });
appendAuditEntry(entry);

const history = loadAuditLog();
console.log(history);
```
