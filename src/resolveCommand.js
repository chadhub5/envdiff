/**
 * resolveCommand.js — CLI handler for the `resolve` subcommand
 */

const { resolveEnvPaths, resolveGlob, labelFromPath } = require('./resolve');

async function resolveCommand(argv) {
  const { inputs = [], glob: globPattern, base, json } = argv;
  const baseDir = base || process.cwd();

  let paths = [];

  try {
    if (globPattern) {
      paths = await resolveGlob(globPattern, baseDir);
    } else if (inputs.length) {
      paths = resolveEnvPaths(inputs, baseDir);
    } else {
      console.error('Provide at least one env name/path or a --glob pattern.');
      process.exitCode = 1;
      return;
    }
  } catch (err) {
    console.error(`resolve error: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const results = paths.map((p) => ({
    label: labelFromPath(p),
    path: p,
  }));

  if (json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log('Resolved env files:');
  for (const { label, path: p } of results) {
    console.log(`  ${label.padEnd(20)} ${p}`);
  }
}

module.exports = { resolveCommand };
