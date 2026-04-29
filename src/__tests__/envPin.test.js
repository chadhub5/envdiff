const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadPins, savePins, pinKey, checkPins, unpin } = require('../envPin');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envpin-'));
}

describe('envPin', () => {
  let tmpDir;
  let pinFile;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    pinFile = path.join(tmpDir, '.envpins.json');
  });

  test('loadPins returns empty object when file does not exist', () => {
    expect(loadPins(pinFile)).toEqual({});
  });

  test('savePins and loadPins round-trip', () => {
    savePins({ API_URL: 'https://example.com' }, pinFile);
    expect(loadPins(pinFile)).toEqual({ API_URL: 'https://example.com' });
  });

  test('pinKey stores key value from env', () => {
    const env = { API_URL: 'https://api.example.com', DEBUG: 'true' };
    const result = pinKey(env, 'API_URL', pinFile);
    expect(result).toEqual({ key: 'API_URL', value: 'https://api.example.com' });
    expect(loadPins(pinFile)).toEqual({ API_URL: 'https://api.example.com' });
  });

  test('pinKey throws if key not in env', () => {
    expect(() => pinKey({}, 'MISSING_KEY', pinFile)).toThrow('Key "MISSING_KEY" not found in env');
  });

  test('checkPins detects match', () => {
    savePins({ PORT: '3000' }, pinFile);
    const results = checkPins({ PORT: '3000' }, pinFile);
    expect(results).toEqual([{ key: 'PORT', pinned: '3000', actual: '3000', status: 'match' }]);
  });

  test('checkPins detects drift', () => {
    savePins({ PORT: '3000' }, pinFile);
    const results = checkPins({ PORT: '4000' }, pinFile);
    expect(results[0].status).toBe('drift');
    expect(results[0].actual).toBe('4000');
  });

  test('checkPins detects missing key', () => {
    savePins({ PORT: '3000' }, pinFile);
    const results = checkPins({}, pinFile);
    expect(results[0]).toEqual({ key: 'PORT', pinned: '3000', actual: undefined, status: 'missing' });
  });

  test('checkPins returns empty array when no pins', () => {
    expect(checkPins({ PORT: '3000' }, pinFile)).toEqual([]);
  });

  test('unpin removes a key', () => {
    savePins({ PORT: '3000', HOST: 'localhost' }, pinFile);
    const removed = unpin('PORT', pinFile);
    expect(removed).toBe(true);
    expect(loadPins(pinFile)).toEqual({ HOST: 'localhost' });
  });

  test('unpin returns false for unknown key', () => {
    savePins({ HOST: 'localhost' }, pinFile);
    expect(unpin('NONEXISTENT', pinFile)).toBe(false);
  });
});
