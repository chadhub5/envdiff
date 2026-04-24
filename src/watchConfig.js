const path = require('path');

const DEFAULT_WATCH_CONFIG = {
  debounceMs: 300,
  clearOnChange: true,
  showTimestamp: true,
  exitOnClean: false,
};

function buildWatchConfig(cliArgs = {}, loadedConfig = {}) {
  const merged = Object.assign({}, DEFAULT_WATCH_CONFIG, loadedConfig.watch || {}, {
    debounceMs: cliArgs.debounce !== undefined ? Number(cliArgs.debounce) : undefined,
    exitOnClean: cliArgs.exitOnClean !== undefined ? Boolean(cliArgs.exitOnClean) : undefined,
  });

  // Remove undefined keys so defaults survive
  Object.keys(merged).forEach((k) => {
    if (merged[k] === undefined) delete merged[k];
  });

  return Object.assign({}, DEFAULT_WATCH_CONFIG, merged);
}

function resolveWatchFiles(rawPaths, cwd = process.cwd()) {
  if (!Array.isArray(rawPaths) || rawPaths.length < 2) {
    throw new Error('watch requires at least two .env file paths');
  }
  return rawPaths.map((p) => path.resolve(cwd, p));
}

module.exports = { buildWatchConfig, resolveWatchFiles, DEFAULT_WATCH_CONFIG };
