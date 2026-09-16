import { SKILL_OPTIONS, getSkillSelectionKey } from './skillOptions.mjs';

export const INSTALL_PROMPT_VERSION = 3;

// Fixed upstream source; installation uses the Agent's permitted native file tools.
export const OFFICIAL_SKILL_SOURCE = Object.freeze({
  repository: 'https://github.com/ant-intl/antom-ai-tools',
  revision: '1014616896d171ddb1c2a37e526beb00c33b79d7',
  targetDirectory: '.builder/skills',
});

export function selectedOfficialSkills(selection) {
  const selected = getSkillSelectionKey(selection).split(',');
  return SKILL_OPTIONS.filter(({ id }) => selected.includes(id));
}

/** The plugin prepares a request; the Builder Agent reads sources and writes files. */
export function createOfficialInstallPrompt(selection) {
  const skills = selectedOfficialSkills(selection);
  const { repository, revision, targetDirectory } = OFFICIAL_SKILL_SOURCE;
  const sources = skills.map(({ name }) => `- ${name}
  Source directory: ${repository}/tree/${revision}/skills/${name}
  Raw entry file: https://raw.githubusercontent.com/ant-intl/antom-ai-tools/${revision}/skills/${name}/SKILL.md
  Destination: ${targetDirectory}/${name}/`).join('\n');

  return `Antom Skill installation request v${INSTALL_PROMPT_VERSION}.
Install the complete original files for these selected Skills in the CURRENT Builder project: ${skills.map(({ name }) => name).join(', ')}.
Use permitted source-reading tools and native project file tools, not a CLI installer. Do not invent tool names, run terminal commands, check runtime versions, modify command policies, or bypass session restrictions. If a source-read or file operation is denied, STOP and report the actual error; do not switch tools to evade the denial.

Official source: ${repository}, fixed commit ${revision}.
${sources}

1. Check the current project using native project/file tools. Work at its root, not on my local computer or in the builder-io-plugin source repository. The target project does NOT need a GitHub remote.
Reuse .builder/skills if it exists; if it is missing, create it during the write step. Check the selected Skill destinations and same-named Skills under .claude/skills. If a selected Skill already contains files (including a partial installation), preserve it and report the conflict without overwriting. An existing parent directory or an unrelated Skill is NOT a conflict. Do not follow symlinks or write outside the project; stop on path conflicts or access errors.

2. Before any writes, obtain the complete file list and full raw contents of ALL selected source directories at the fixed commit, including supporting files and subdirectories. Fetch the actual original files, not a summary, rendered GitHub page, HTML wrapper or truncated response. If the source listing or any file is unavailable/incomplete, STOP before writing and report the source-read failure. Do not substitute a mirror, another revision or reconstructed content.

3. Using only permitted native project file tools, create missing destination directories, then copy each original file to its corresponding destination. Preserve relative paths and file contents, including SKILL.md frontmatter. Do not rewrite the Skill, add Builder-specific instructions, copy provider/plugin/MCP directories, or overwrite existing files. Preserve unrelated project files and Skills. Do not create or modify skills-lock.json, .env, .env.example, Secrets or credentials. Do not execute downloaded scripts, install dependencies, generate payment code or analyze bills.

4. Read back the written files with native project file tools. Compare the complete destination file list and contents with the source data obtained in step 2. Report source retrieval, files written, and read-back comparison separately, with actual paths/counts and each SKILL.md name and description. If writing fails, STOP and list any files already written; do not claim rollback. If comparison is unavailable or differs, report installation as unverified, not successful. Never invent a hash or claim a comparison you did not perform.

5. Only after file verification, ask me to start a new Builder chat and invoke the selected Skill to verify discovery. File installation, Agent discovery and actual payment/bill-analysis results are separate checks. Copying this prompt is not installation or end-to-end acceptance.
`;
}
