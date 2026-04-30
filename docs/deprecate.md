# envdiff deprecate

The `deprecate` command scans your `.env` files for keys that have been marked as deprecated in your envdiff configuration. It reports findings and suggests migration paths where replacements are defined.

## Configuration

Add a `deprecations` section to your `.envdiff.json` (or `envdiff` key in `package.json`):

```json
{
  "deprecations": {
    "OLD_API_KEY": {
      "reason": "Migrated to new auth system",
      "replacement": "API_KEY"
    },
    "LEGACY_DB_URL": {
      "reason": "Renamed for clarity",
      "replacement": "DATABASE_URL"
    },
    "DEBUG_MODE": {
      "reason": "Feature removed in v2"
    }
  }
}
```

## Usage

```bash
npx envdiff deprecate .env .env.staging
```

### Flags

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON |
| `--config <path>` | Path to a custom config file |

## Output

```
=== .env ===
Deprecated keys found:
  [DEPRECATED] OLD_API_KEY — Migrated to new auth system (replace with: API_KEY)

Migration suggestions:
  OLD_API_KEY → API_KEY  [✗ replacement missing]
```

## Exit Codes

- `0` — No deprecated keys found
- `1` — One or more deprecated keys detected

## Notes

- Keys without a `replacement` are flagged but no migration suggestion is generated.
- If the replacement key is already present in the same file, the migration is marked as `✓ replacement present`.
