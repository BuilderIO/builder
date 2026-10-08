import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OFFICIAL_SKILL_SOURCE } from '../src/officialSkillInstall.mjs';

/** Record the tested browser bundle and upstream pin without bundling Skills. */
export function createBuildMetadata(plugin, revision) {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Build requires a complete commit SHA.');
  return {
    revision,
    pluginSha256: createHash('sha256').update(plugin).digest('hex'),
    officialSkillSource: OFFICIAL_SKILL_SOURCE,
  };
}

const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const revision = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const plugin = await readFile(path.join(root, 'dist/plugin.system.js'));
  await writeFile(path.join(root, 'dist/build-metadata.json'), JSON.stringify(createBuildMetadata(plugin, revision), null, 2) + '\n');
}
