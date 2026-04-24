const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./parser');
const { diffEnvs, isClean } = require('./diff');
const { renderReport } = require('./reporter');

const DEFAULT_DEBOUNCE_MS = 300;

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function watchEnvFiles(filePaths, options = {}) {
  const { debounceMs = DEFAULT_DEBOUNCE_MS, onChange, onError } = options;
  const watchers = [];
  const lastContents = new Map();

  function runDiff() {
    try {
      const envs = {};
      for (const filePath of filePaths) {
        const label = path.basename(filePath);
        envs[label] = parseEnvFile(filePath);
        lastContents.set(filePath, envs[label]);
      }
      const labels = Object.keys(envs);
      if (labels.length < 2) return;
      const result = diffEnvs(envs);
      if (onChange) {
        onChange(result, isClean(result));
      } else {
        console.clear();
        console.log('[envdiff watch] Change detected\n');
        console.log(renderReport(result));
      }
    } catch (err) {
      if (onError) onError(err);
      else console.error('[envdiff watch] Error:', err.message);
    }
  }

  const debouncedDiff = debounce(runDiff, debounceMs);

  for (const filePath of filePaths) {
    const watcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change' || eventType === 'rename') {
        debouncedDiff();
      }
    });
    watchers.push(watcher);
  }

  runDiff();

  return {
    stop() {
      watchers.forEach((w) => w.close());
    },
  };
}

module.exports = { watchEnvFiles, debounce };
