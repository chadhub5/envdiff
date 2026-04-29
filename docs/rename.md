# envdiff rename

The `rename` command analyses two `.env` files and suggests keys that may have been **renamed** between them — rather than genuinely added or removed.

It uses string-similarity scoring (Levenshtein distance) to find close matches among keys that are missing in one file but present in the other.

## Usage

```bash
envdiff rename <file-a> <file-b> [options]
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--threshold <n>` | `0.7` | Minimum similarity score (0–1) to report a suggestion |
| `--json` | `false` | Output suggestions as JSON |

## Examples

```bash
# Basic comparison
envdiff rename .env.staging .env.production

# Stricter threshold — only very similar keys
envdiff rename .env.staging .env.production --threshold 0.85

# Machine-readable output
envdiff rename .env.staging .env.production --json
```

### Sample output

```
Possible key renames detected:
  DB_PASS  →  DB_PASSWORD  (similarity: 82%)
  API_TOKEN  →  API_ACCESS_TOKEN  (similarity: 76%)

Found 2 suggestion(s) with threshold 0.7.
```

### JSON output

```json
[
  { "from": "DB_PASS", "to": "DB_PASSWORD", "score": 0.82 },
  { "from": "API_TOKEN", "to": "API_ACCESS_TOKEN", "score": 0.76 }
]
```

## How it works

1. A diff is computed between the two files.
2. Keys only in file A ("removed") and keys only in file B ("added") are extracted.
3. Every removed/added pair is scored using the Levenshtein similarity ratio.
4. Pairs above the threshold are returned, sorted by score.

## Notes

- A threshold of `1.0` only matches identical keys (no renames found).
- A threshold of `0.0` reports every removed/added pair — not useful in practice.
- The default `0.7` is a good starting point for most codebases.
