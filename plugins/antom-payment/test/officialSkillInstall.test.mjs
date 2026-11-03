import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INSTALL_PROMPT_VERSION, OFFICIAL_SKILL_SOURCE, createOfficialInstallPrompt, selectedOfficialSkills } from '../src/officialSkillInstall.mjs';
import { copyPlainText } from '../src/clipboard.mjs';

const selections = [['integration'], ['integration', 'integration']];

test('v3 pins the official source and native Builder destination without an installer', () => {
  assert.equal(INSTALL_PROMPT_VERSION, 3);
  assert.deepEqual(OFFICIAL_SKILL_SOURCE, {
    repository: 'https://github.com/ant-intl/antom-ai-tools',
    revision: '1014616896d171ddb1c2a37e526beb00c33b79d7',
    targetDirectory: '.builder/skills',
  });
  assert.ok(Object.isFrozen(OFFICIAL_SKILL_SOURCE));
});

test('each selection names only its own source directories and destination mappings', () => {
  assert.deepEqual(selectedOfficialSkills(['integration', 'integration']).map(s => s.name),
    ['antom-integration']);
  assert.doesNotMatch(createOfficialInstallPrompt(['integration']), /antom-reconciliation-expert/);
  assert.throws(() => createOfficialInstallPrompt(['reconciliation']), /Unsupported/);
  assert.throws(() => createOfficialInstallPrompt(['integration', 'reconciliation']), /Unsupported/);
  for (const selection of selections) {
    const prompt = createOfficialInstallPrompt(selection);
    for (const { name } of selectedOfficialSkills(selection)) {
      assert.ok(prompt.includes('Source directory: ' + OFFICIAL_SKILL_SOURCE.repository + '/tree/' + OFFICIAL_SKILL_SOURCE.revision + '/skills/' + name));
      assert.ok(prompt.includes('Raw entry file: https://raw.githubusercontent.com/ant-intl/antom-ai-tools/' + OFFICIAL_SKILL_SOURCE.revision + '/skills/' + name + '/SKILL.md'));
      assert.ok(prompt.includes('Destination: .builder/skills/' + name + '/'));
    }
    assert.doesNotMatch(prompt, /tree\/main|@latest|mo-cha-lauren/);
  }
});

test('empty, unrecognized and injected selections cannot become paths or prompt instructions', () => {
  for (const selection of [null, [], 'integration', ['all'], ['integration; touch x'], ['../'], [null], [{}]]) {
    assert.throws(() => createOfficialInstallPrompt(selection), /Select at least|Unsupported/);
  }
});

test('parent folders are reused, missing folders created and existing Skill files preserved', () => {
  const prompt = createOfficialInstallPrompt(['integration']);
  assert.match(prompt, /Reuse .builder\/skills if it exists; if it is missing, create it during the write step/);
  assert.match(prompt, /An existing parent directory or an unrelated Skill is NOT a conflict/);
  assert.match(prompt, /If a selected Skill already contains files \(including a partial installation\), preserve it/);
  assert.match(prompt, /same-named Skills under .claude\/skills/);
  assert.match(prompt, /Do not follow symlinks or write outside the project/);
  assert.match(prompt, /target project does NOT need a GitHub remote/);
  assert.match(prompt, /not on my local computer or in the builder-io-plugin source repository/);
});

test('source retrieval requires complete raw files before writing, with no reconstructed substitutes', () => {
  const prompt = createOfficialInstallPrompt(['integration']);
  assert.match(prompt, /Before any writes, obtain the complete file list and full raw contents of ALL selected source directories/);
  assert.match(prompt, /including supporting files and subdirectories/);
  assert.match(prompt, /not a summary, rendered GitHub page, HTML wrapper or truncated response/);
  assert.match(prompt, /STOP before writing and report the source-read failure/);
  assert.match(prompt, /Do not substitute a mirror, another revision or reconstructed content/);
  assert.ok(prompt.indexOf('2. Before any writes') < prompt.indexOf('3. Using only permitted native project file tools'));
});

test('file writes preserve source structure and do not configure runtimes, locks or payments', () => {
  for (const selection of selections) {
    const prompt = createOfficialInstallPrompt(selection);
    assert.ok(prompt.startsWith('Antom Skill installation request v3.\n'));
    assert.match(prompt, /Using only permitted native project file tools, create missing destination directories/);
    assert.match(prompt, /Preserve relative paths and file contents, including SKILL.md frontmatter/);
    assert.match(prompt, /Do not rewrite the Skill, add Builder-specific instructions, copy provider\/plugin\/MCP directories, or overwrite existing files/);
    assert.match(prompt, /Do not create or modify skills-lock.json, .env, .env.example, Secrets or credentials/);
    assert.match(prompt, /Do not execute downloaded scripts, install dependencies, generate payment code or analyze bills/);
    assert.doesNotMatch(prompt, /npx|npm|--version|--registry|DISABLE_TELEMETRY|git clone|curl |wget |ANTOM_CLIENT_ID|antom\.setup\.json/);
    assert.ok(!prompt.includes('```'), 'No runnable command blocks');
  }
});

test('policy denial stops the file operation without granting permissions or suggesting a workaround', () => {
  const prompt = createOfficialInstallPrompt(['integration']);
  assert.match(prompt, /Do not invent tool names, run terminal commands, check runtime versions, modify command policies, or bypass session restrictions/);
  assert.match(prompt, /If a source-read or file operation is denied, STOP and report the actual error/);
  assert.match(prompt, /do not switch tools to evade the denial/);
});

test('read-back compares actual paths and contents and reports partial or unverified installation truthfully', () => {
  const prompt = createOfficialInstallPrompt(['integration']);
  assert.match(prompt, /Compare the complete destination file list and contents with the source data obtained in step 2/);
  assert.match(prompt, /Report source retrieval, files written, and read-back comparison separately/);
  assert.match(prompt, /actual paths\/counts and each SKILL.md name and description/);
  assert.match(prompt, /If writing fails, STOP and list any files already written; do not claim rollback/);
  assert.match(prompt, /If comparison is unavailable or differs, report installation as unverified, not successful/);
  assert.match(prompt, /Never invent a hash or claim a comparison you did not perform/);
  assert.match(prompt, /Only after file verification, ask me to start a new Builder chat/);
  assert.match(prompt, /File installation, Agent discovery and actual payment\/bill-analysis results are separate checks/);
  assert.match(prompt, /Copying this prompt is not installation or end-to-end acceptance/);
});

test('clipboard prefers gesture-preserving plain-text write and falls back to writeText', async () => {
  let result;
  class Item { constructor(data) { this.data = data; } }
  await copyPlainText('prompt', {
    ClipboardItemConstructor: Item, BlobConstructor: Blob,
    clipboard: { async write(items) { result = await items[0].data['text/plain'].text(); } },
  });
  assert.equal(result, 'prompt');
  await copyPlainText('fallback', {
    ClipboardItemConstructor: Item, BlobConstructor: Blob,
    clipboard: { async write() { throw new Error('denied'); }, async writeText(text) { result = text; } },
  });
  assert.equal(result, 'fallback');
  await assert.rejects(copyPlainText('x', { navigatorObject: {} }), /not available/);
});
