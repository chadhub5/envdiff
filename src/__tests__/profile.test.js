const fs = require('fs');
const os = require('os');
const path = require('path');
const { saveProfile, getProfile, deleteProfile, listProfiles, loadProfiles } = require('../profile');
const { profileCommand, formatProfileList } = require('../profileCommand');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envdiff-profile-'));
}

describe('profile module', () => {
  let tmpDir, profilePath;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    profilePath = path.join(tmpDir, 'profiles.json');
  });

  test('loadProfiles returns empty object when file missing', () => {
    expect(loadProfiles(profilePath)).toEqual({});
  });

  test('saveProfile persists a profile', () => {
    const saved = saveProfile('dev', ['.env.dev', '.env.local'], profilePath);
    expect(saved.files).toEqual(['.env.dev', '.env.local']);
    expect(saved.updatedAt).toBeDefined();
  });

  test('getProfile retrieves saved profile', () => {
    saveProfile('staging', ['.env.staging'], profilePath);
    const p = getProfile('staging', profilePath);
    expect(p.files).toEqual(['.env.staging']);
  });

  test('getProfile throws for unknown profile', () => {
    expect(() => getProfile('nope', profilePath)).toThrow('not found');
  });

  test('deleteProfile removes a profile', () => {
    saveProfile('tmp', ['.env'], profilePath);
    deleteProfile('tmp', profilePath);
    expect(() => getProfile('tmp', profilePath)).toThrow('not found');
  });

  test('listProfiles returns all profiles', () => {
    saveProfile('a', ['.env.a'], profilePath);
    saveProfile('b', ['.env.b', '.env.c'], profilePath);
    const list = listProfiles(profilePath);
    expect(list).toHaveLength(2);
    expect(list.map(p => p.name)).toContain('a');
  });

  test('saveProfile throws on empty name', () => {
    expect(() => saveProfile('', ['.env'], profilePath)).toThrow();
  });

  test('saveProfile throws on empty files array', () => {
    expect(() => saveProfile('x', [], profilePath)).toThrow();
  });
});

describe('profileCommand', () => {
  let tmpDir, profilePath, out, err;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    profilePath = path.join(tmpDir, 'profiles.json');
    out = jest.fn();
    err = jest.fn();
  });

  test('save command creates profile', () => {
    const code = profileCommand(['save', 'dev', '.env.dev', '.env'], { out, err, profilePath });
    expect(code).toBe(0);
    expect(out).toHaveBeenCalledWith(expect.stringContaining('dev'));
  });

  test('list command shows no profiles message', () => {
    profileCommand(['list'], { out, err, profilePath });
    expect(out).toHaveBeenCalledWith('No profiles saved.');
  });

  test('get command prints files', () => {
    profileCommand(['save', 'prod', '.env.prod'], { out, err, profilePath });
    profileCommand(['get', 'prod'], { out, err, profilePath });
    expect(out).toHaveBeenCalledWith(expect.stringContaining('.env.prod'));
  });

  test('delete command removes profile', () => {
    profileCommand(['save', 'old', '.env'], { out, err, profilePath });
    const code = profileCommand(['delete', 'old'], { out, err, profilePath });
    expect(code).toBe(0);
  });

  test('unknown subcommand returns 1', () => {
    const code = profileCommand(['unknown'], { out, err, profilePath });
    expect(code).toBe(1);
  });
});
