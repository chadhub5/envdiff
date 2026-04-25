const fs = require('fs');
const os = require('os');
const path = require('path');
const { watchEnvFiles, debounce } = require('../watch');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-watch-'));
}

function writeEnvFile(dir, name, content) {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe('debounce', () => {
  jest.useFakeTimers();

  it('delays execution', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets timer on repeated calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced();
    jest.advanceTimersByTime(50);
    debounced();
    jest.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('watchEnvFiles', () => {
  let tmpDir;

  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true }); });

  it('calls onChange with diff result on start', (done) => {
    const f1 = writeEnvFile(tmpDir, '.env.dev', 'A=1\nB=2');
    const f2 = writeEnvFile(tmpDir, '.env.prod', 'A=1');
    const handle = watchEnvFiles([f1, f2], {
      onChange(result, clean) {
        expect(clean).toBe(false);
        expect(result).toBeDefined();
        handle.stop();
        done();
      },
    });
  });

  it('reports clean when files match', (done) => {
    const f1 = writeEnvFile(tmpDir, '.env.a', 'X=1');
    const f2 = writeEnvFile(tmpDir, '.env.b', 'X=1');
    const handle = watchEnvFiles([f1, f2], {
      onChange(result, clean) {
        expect(clean).toBe(true);
        handle.stop();
        done();
      },
    });
  });

  it('stop() closes watchers without error', () => {
    const f1 = writeEnvFile(tmpDir, '.env.x', 'K=v');
    const f2 = writeEnvFile(tmpDir, '.env.y', 'K=v');
    const handle = watchEnvFiles([f1, f2], { onChange: () => {} });
    expect(() => handle.stop()).not.toThrow();
  });

  it('stop() is idempotent — calling it twice does not throw', () => {
    const f1 = writeEnvFile(tmpDir, '.env.x', 'K=v');
    const f2 = writeEnvFile(tmpDir, '.env.y', 'K=v');
    const handle = watchEnvFiles([f1, f2], { onChange: () => {} });
    handle.stop();
    expect(() => handle.stop()).not.toThrow();
  });
});
