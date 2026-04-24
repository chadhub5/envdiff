const path = require('path');
const { buildWatchConfig, resolveWatchFiles, DEFAULT_WATCH_CONFIG } = require('../watchConfig');

describe('buildWatchConfig', () => {
  it('returns defaults when no args given', () => {
    const cfg = buildWatchConfig();
    expect(cfg).toEqual(DEFAULT_WATCH_CONFIG);
  });

  it('merges cli debounce', () => {
    const cfg = buildWatchConfig({ debounce: '500' });
    expect(cfg.debounceMs).toBe(500);
  });

  it('merges loaded config watch section', () => {
    const cfg = buildWatchConfig({}, { watch: { exitOnClean: true } });
    expect(cfg.exitOnClean).toBe(true);
  });

  it('cli args override loaded config', () => {
    const cfg = buildWatchConfig({ debounce: '100' }, { watch: { debounceMs: 999 } });
    expect(cfg.debounceMs).toBe(100);
  });

  it('does not include undefined keys', () => {
    const cfg = buildWatchConfig({});
    Object.values(cfg).forEach((v) => expect(v).not.toBeUndefined());
  });
});

describe('resolveWatchFiles', () => {
  it('resolves relative paths to absolute', () => {
    const result = resolveWatchFiles(['.env.dev', '.env.prod'], '/project');
    expect(result[0]).toBe('/project/.env.dev');
    expect(result[1]).toBe('/project/.env.prod');
  });

  it('throws when fewer than 2 files provided', () => {
    expect(() => resolveWatchFiles(['.env'])).toThrow('at least two');
  });

  it('throws for non-array input', () => {
    expect(() => resolveWatchFiles(null)).toThrow('at least two');
  });

  it('handles absolute paths unchanged', () => {
    const abs = path.resolve('/tmp/.env.test');
    const result = resolveWatchFiles([abs, '/tmp/.env.prod'], '/other');
    expect(result[0]).toBe(abs);
  });
});
