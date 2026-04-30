# Secret Scan (`envdiff secret`)

Scan one or more `.env` files for potentially sensitive values and key names.

## Usage

```bash
envdiff secret .env
envdiff secret .env .env.production
envdiff secret .env --json
envdiff secret .env --strict   # exit code 1 if secrets found
```

## Detection Methods

envdiff uses two complementary strategies:

### 1. Key-name heuristics

Keys matching patterns like `*PASSWORD*`, `*TOKEN*`, `*SECRET*`, `*API_KEY*`, `*CREDENTIAL*` are flagged as `sensitive_key`.

### 2. Value analysis

| Reason | Description |
|---|---|
| `jwt` | Matches JWT token structure (`eyJ...`) |
| `url_with_creds` | URL containing `user:pass@host` |
| `high_entropy` | Shannon entropy > 4.5 on strings ≥ 16 chars |
| `api_key` | Long alphanumeric string (≥ 20 chars) |
| `private_key` | Contains `BEGIN ... PRIVATE` markers |

## Output

```
📄 .env
⚠️  Found 2 potential secret(s):

  • DB_PASSWORD  [sensitive-key]
  • AUTH_TOKEN   [sensitive-key, value:high_entropy]
   Reasons: sensitive_key(1), high_entropy(1)
```

## JSON Output

Use `--json` to get machine-readable output:

```json
{
  "file": ".env",
  "findings": [
    { "key": "DB_PASSWORD", "reason": "sensitive_key", "byKey": true, "byValue": null }
  ],
  "summary": { "total": 1, "byReason": { "sensitive_key": 1 }, "keys": ["DB_PASSWORD"] }
}
```

## Exit Codes

- `0` — no secrets found (or `--strict` not set)
- `1` — secrets found and `--strict` flag is active
