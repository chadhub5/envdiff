# env tagging

The `tag` feature lets you annotate `.env` keys with custom labels defined in your `envdiff` config. This makes it easy to filter, audit, and report on specific subsets of keys — for example, all `auth`-related secrets or `db` connection strings.

## Configuration

Define tags in your `envdiff.config.json` (or `.envdiffrc`):

```json
{
  "tags": {
    "auth": ["JWT_SECRET", "API_KEY", "SESSION_TOKEN"],
    "db": ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASS"],
    "infra": ["REDIS_URL", "QUEUE_URL"]
  }
}
```

A key can belong to multiple tags.

## CLI Usage

### Show tag coverage for one or more files

```bash
envdiff tag .env.production
```

Output:
```
[.env.production]
Tag Coverage (12 keys total):
  [auth] 3 key(s)
  [db] 4 key(s)
  [infra] 2 key(s)
  [untagged] 3 key(s)
```

### Filter keys by tag

```bash
envdiff tag .env.production --filter auth
```

Output:
```
[.env.production] Keys tagged "auth":
  JWT_SECRET
  API_KEY
  SESSION_TOKEN
```

## API

```js
const { buildTagIndex, annotateEnv, filterByTag, tagCoverageSummary, formatTagReport } = require('./src/envTag');

const tagMap = { auth: ['JWT_SECRET'] };
const index = buildTagIndex(tagMap);
const annotated = annotateEnv({ JWT_SECRET: 'abc', PORT: '3000' }, index);
const filtered = filterByTag(annotated, 'auth');
const summary = tagCoverageSummary(env, index);
console.log(formatTagReport(summary));
```
