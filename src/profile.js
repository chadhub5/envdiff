/**
 * profile.js — Named environment profile management
 * Allows saving/loading named sets of env file paths for quick comparison
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_PROFILE_FILE = '.envdiff-profiles.json';

function loadProfiles(profilePath = DEFAULT_PROFILE_FILE) {
  if (!fs.existsSync(profilePath)) return {};
  try {
    const raw = fs.readFileSync(profilePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveProfile(name, files, profilePath = DEFAULT_PROFILE_FILE) {
  if (!name || typeof name !== 'string') throw new Error('Profile name must be a non-empty string');
  if (!Array.isArray(files) || files.length === 0) throw new Error('Profile must include at least one file');

  const profiles = loadProfiles(profilePath);
  profiles[name] = { files, updatedAt: new Date().toISOString() };
  fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2));
  return profiles[name];
}

function getProfile(name, profilePath = DEFAULT_PROFILE_FILE) {
  const profiles = loadProfiles(profilePath);
  if (!profiles[name]) throw new Error(`Profile "${name}" not found`);
  return profiles[name];
}

function deleteProfile(name, profilePath = DEFAULT_PROFILE_FILE) {
  const profiles = loadProfiles(profilePath);
  if (!profiles[name]) throw new Error(`Profile "${name}" not found`);
  delete profiles[name];
  fs.writeFileSync(profilePath, JSON.stringify(profiles, null, 2));
  return true;
}

function listProfiles(profilePath = DEFAULT_PROFILE_FILE) {
  const profiles = loadProfiles(profilePath);
  return Object.entries(profiles).map(([name, data]) => ({
    name,
    files: data.files,
    updatedAt: data.updatedAt
  }));
}

module.exports = { loadProfiles, saveProfile, getProfile, deleteProfile, listProfiles, DEFAULT_PROFILE_FILE };
