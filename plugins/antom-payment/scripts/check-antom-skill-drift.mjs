import { createHash } from 'node:crypto';
import { OFFICIAL_SKILL_SOURCE } from '../src/officialSkillInstall.mjs';

const base = 'https://raw.githubusercontent.com/ant-intl/antom-ai-tools';
const relative = 'skills/antom-integration/SKILL.md';
async function digest(revision) {
  const response = await fetch(`${base}/${revision}/${relative}`, {
    signal: AbortSignal.timeout(30_000),
    headers: { 'user-agent': 'antom-builder-io-plugin-skill-drift-check' },
  });
  if (!response.ok) throw new Error(`Unable to fetch upstream Skill: HTTP ${response.status}`);
  return createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
}
const [pinned, latest] = await Promise.all([digest(OFFICIAL_SKILL_SOURCE.revision), digest('main')]);
if (pinned !== latest) throw new Error('Upstream Skill changed. Review the source before updating the installation pin.');
console.log('No drift from the actual installation pin; no source files were changed.');
