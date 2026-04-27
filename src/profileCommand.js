/**
 * profileCommand.js — CLI handler for profile subcommands
 */

const { saveProfile, getProfile, deleteProfile, listProfiles } = require('./profile');

function formatProfileList(profiles) {
  if (profiles.length === 0) return 'No profiles saved.';
  return profiles
    .map(p => `  ${p.name} (${p.files.length} file${p.files.length !== 1 ? 's' : ''}) — updated ${p.updatedAt}`)
    .join('\n');
}

function profileCommand(argv, options = {}) {
  const out = options.out || console.log;
  const err = options.err || console.error;
  const profilePath = options.profilePath;

  const [subcommand, name, ...rest] = argv;

  try {
    switch (subcommand) {
      case 'save': {
        if (!name) { err('Usage: profile save <name> <file1> [file2...]'); return 1; }
        const files = rest;
        if (files.length === 0) { err('Provide at least one env file path'); return 1; }
        const saved = saveProfile(name, files, profilePath);
        out(`Profile "${name}" saved with ${saved.files.length} file(s).`);
        return 0;
      }
      case 'get': {
        if (!name) { err('Usage: profile get <name>'); return 1; }
        const profile = getProfile(name, profilePath);
        out(`Profile "${name}":`);
        profile.files.forEach(f => out(`  ${f}`));
        return 0;
      }
      case 'delete': {
        if (!name) { err('Usage: profile delete <name>'); return 1; }
        deleteProfile(name, profilePath);
        out(`Profile "${name}" deleted.`);
        return 0;
      }
      case 'list': {
        const profiles = listProfiles(profilePath);
        out(formatProfileList(profiles));
        return 0;
      }
      default:
        err(`Unknown profile subcommand: "${subcommand}". Use save, get, delete, or list.`);
        return 1;
    }
  } catch (e) {
    err(`Error: ${e.message}`);
    return 1;
  }
}

module.exports = { profileCommand, formatProfileList };
