/**
 * envTag.js — Tag keys with custom labels for grouping, filtering, and reporting
 */

/**
 * Load tags from a plain object map: { tagName: [key1, key2, ...] }
 * Returns inverted map: { key: [tag1, tag2] }
 */
function buildTagIndex(tagMap) {
  const index = {};
  for (const [tag, keys] of Object.entries(tagMap)) {
    for (const key of keys) {
      if (!index[key]) index[key] = [];
      index[key].push(tag);
    }
  }
  return index;
}

/**
 * Annotate env keys with their tags.
 * Returns array of { key, value, tags }
 */
function annotateEnv(env, tagIndex) {
  return Object.entries(env).map(([key, value]) => ({
    key,
    value,
    tags: tagIndex[key] || [],
  }));
}

/**
 * Filter annotated entries by a given tag.
 */
function filterByTag(annotated, tag) {
  return annotated.filter((entry) => entry.tags.includes(tag));
}

/**
 * Summarize tag coverage: how many keys per tag, how many untagged.
 */
function tagCoverageSummary(env, tagIndex) {
  const keys = Object.keys(env);
  const tagCounts = {};
  let untagged = 0;

  for (const key of keys) {
    const tags = tagIndex[key] || [];
    if (tags.length === 0) {
      untagged++;
    } else {
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }

  return { tagCounts, untagged, total: keys.length };
}

/**
 * Format a human-readable tag coverage report.
 */
function formatTagReport(summary) {
  const lines = [`Tag Coverage (${summary.total} keys total):`];
  for (const [tag, count] of Object.entries(summary.tagCounts)) {
    lines.push(`  [${tag}] ${count} key(s)`);
  }
  if (summary.untagged > 0) {
    lines.push(`  [untagged] ${summary.untagged} key(s)`);
  }
  return lines.join('\n');
}

module.exports = {
  buildTagIndex,
  annotateEnv,
  filterByTag,
  tagCoverageSummary,
  formatTagReport,
};
