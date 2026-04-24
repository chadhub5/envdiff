const { loadConfig } = require('./config');
const { buildWatchConfig, resolveWatchFiles } = require('./watchConfig');
const { watchEnvFiles } = require('./watch');
const { renderReport } = require('./reporter');

function timestamp() {
  return new Date().toLocaleTimeString();
}

async function runWatchCommand(filePaths, cliArgs = {}) {
  let loadedConfig = {};
  try {
    loadedConfig = await loadConfig();
  } catch (_) {
    // config is optional
  }

  const watchCfg = buildWatchConfig(cliArgs, loadedConfig);
  const resolvedPaths = resolveWatchFiles(filePaths);

  console.log(`[envdiff] Watching ${resolvedPaths.length} files...`);
  resolvedPaths.forEach((p) => console.log(`  ${p}`));
  console.log();

  const handle = watchEnvFiles(resolvedPaths, {
    debounceMs: watchCfg.debounceMs,
    onChange(result, clean) {
      if (watchCfg.clearOnChange) console.clear();
      if (watchCfg.showTimestamp) {
        console.log(`[envdiff watch] ${timestamp()}`);
      }
      console.log(renderReport(result));
      if (clean) {
        console.log('✓ All environments are in sync.');
        if (watchCfg.exitOnClean) {
          handle.stop();
          process.exit(0);
        }
      }
    },
    onError(err) {
      console.error('[envdiff watch] Error:', err.message);
    },
  });

  process.on('SIGINT', () => {
    console.log('\n[envdiff] Stopped watching.');
    handle.stop();
    process.exit(0);
  });

  return handle;
}

module.exports = { runWatchCommand };
