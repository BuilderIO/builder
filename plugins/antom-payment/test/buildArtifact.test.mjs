import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { test } from 'node:test';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createOfficialInstallPrompt, OFFICIAL_SKILL_SOURCE } from '../src/officialSkillInstall.mjs';

const require = createRequire(import.meta.url);
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const bundlePath = path.join(root, pkg.main);
function captureSystemRegistration(bundle, globals = {}) {
  let registration;
  vm.runInNewContext(bundle, {
    System: {
      register(dependencies, declare) {
        registration = { dependencies, declare };
      },
    },
    AbortController,
    Blob: globalThis.Blob,
    URL,
    clearTimeout,
    console,
    crypto: webcrypto,
    fetch() { throw new Error('Browser must not fetch source files'); },
    setTimeout,
    TextDecoder,
    TextEncoder,
    ...globals,
  });
  return registration;
}

function executeBundle(bundle, { react = React, globals = {} } = {}) {
  const systemRegistration = captureSystemRegistration(bundle, globals);
  const registrations = [];
  const editors = [];
  const snackMessages = [];
  const appState = {
    get user() { throw new Error('Payment settings must never be accessed'); },
    snackBar: {
      show(message) {
        snackMessages.push(message);
      },
    },
  };
  const modules = {
    '@builder.io/app-context': { default: appState },
    '@builder.io/react': {
      Builder: {
        register(type, config) {
          registrations.push([type, config]);
        },
        registerEditor(editor) {
          editors.push(editor);
        },
      },
    },
    '@emotion/core': require('@emotion/core'),
    react,
    'react-dom': require('react-dom'),
  };
  const declared = systemRegistration.declare(() => {}, {});
  systemRegistration.dependencies.forEach((dependency, index) => {
    declared.setters[index](modules[dependency]);
  });
  declared.execute();
  return { appState, registrations, snackMessages, editors };
}

function plainText(markup) {
  return markup
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function panelHandlerFixture(bundle, writeText, { fetch: fetchFunction = () => { throw new Error('Unexpected network access'); } } = {}) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  let tree;
  let disposed = false;
  let updatesAfterUnmount = 0;
  const react = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, (value) => {
        if (disposed) updatesAfterUnmount += 1;
        slots[index].value = typeof value === 'function' ? value(slots[index].value) : value;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(effect, dependencies) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || dependencies.some((value, i) => value !== previous.dependencies[i])) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, cleanup: effect() };
        });
      }
    },
  };
  const fixture = executeBundle(bundle, {
    react,
    globals: {
      fetch: fetchFunction,
      navigator: { clipboard: { writeText } },
    },
  });
  const registration = fixture.registrations.find(([type]) => type === 'editor.editTab')[1];
  const panel = registration.component();
  const render = () => {
    cursor = 0;
    effects = [];
    tree = panel.type(panel.props);
    for (const effect of effects) effect();
    return tree;
  };
  const find = (predicate, element = tree) => {
    if (!React.isValidElement(element)) return null;
    if (predicate(element.props)) return element.props;
    for (const child of React.Children.toArray(element.props.children)) {
      const result = find(predicate, child);
      if (result) return result;
    }
    return null;
  };
  render();
  return {
    ...fixture,
    render,
    find,
    skill: (id) => find((props) => props.type === 'checkbox' && props.value === id),
    button: (label) => find((props) => typeof props.onClick === 'function' && props.children === label),
    manualRequest: () => find((props) => props['aria-label'] === 'Install prompt to copy manually'),
    updatesAfterUnmount: () => updatesAfterUnmount,
    setup: () => find((props) => typeof props.onClick === 'function' &&
      ['Copy install prompt', 'Copying…', 'Prompt copied'].includes(props.children)),
    async settle() {
      for (let i = 0; i < 6; i += 1) {
        await new Promise(setImmediate);
        render();
      }
    },
    cleanup() {
      for (const slot of slots) slot?.cleanup?.();
      disposed = true;
    },
  };
}


test('production entry, license and README package installation exist', async () => {
  assert.ok((await stat(bundlePath)).isFile());
  assert.ok((await stat(path.join(root, 'LICENSE'))).isFile());
  const readme = await readFile(path.join(root, 'README.md'), 'utf8');
  assert.ok(readme.replace(/\r\n/g, '\n').includes('```text\n' + pkg.name + '\n```'));
});

test('SystemJS registers only the plugin and tab; no settings or lifecycle popup', async () => {
  const bundle = await readFile(bundlePath, 'utf8');
  const registration = captureSystemRegistration(bundle);
  for (const dependency of ['@builder.io/react', '@builder.io/app-context', '@emotion/core']) {
    assert.ok(registration.dependencies.includes(dependency));
  }
  const { registrations, editors } = executeBundle(bundle);
  assert.deepEqual(registrations.map(([type]) => type), ['plugin', 'editor.editTab']);
  assert.equal(editors.length, 0);
  const plugin = registrations[0][1];
  assert.equal(plugin.id, pkg.name);
  assert.equal(plugin.name, 'Antom Skills');
  for (const removed of ['settings', 'onSave', 'ctaText']) assert.equal(plugin[removed], undefined);
  assert.doesNotMatch(bundle, /app\.onLoad|triggerSettingsDialog|updateSettings|hasConnected|nonSecretPaymentConfig|ANTOM_AUTH_MODE|createConfigExport/);
  assert.ok(bundle.includes(OFFICIAL_SKILL_SOURCE.repository));
  assert.ok(bundle.includes(OFFICIAL_SKILL_SOURCE.revision));
});

test('panel and local help show one installation flow, no payment configuration or mirror gate', async () => {
  const bundle = await readFile(bundlePath, 'utf8');
  const { registrations } = executeBundle(bundle);
  const component = registrations.find(([type]) => type === 'editor.editTab')[1].component;
  const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(component));
  const visible = plainText(markup);
  assert.equal((markup.match(/\bMuiCard-root\b/g) || []).length, 2);
  for (const label of ['Antom Skills', '1. Install Skills', '2. Use Skills', 'Copy install prompt', 'Copy example', 'Usage guide']) {
    assert.ok(visible.includes(label), label);
  }
  assert.match(visible, /Copying does not install Skills/);
  assert.match(visible, /Payment integration/);
  assert.equal((markup.match(/type="checkbox"/g) || []).length, 1);
  assert.doesNotMatch(bundle, /Bill analysis|antom-reconciliation-expert/);
  assert.doesNotMatch(markup, /<select\b|<details\b|Edit settings|Download config|manifest verified/);
  assert.doesNotMatch(bundle, /Public npm|Project test package|Copy setup request|Copy config command|Loading settings|mo-cha-lauren\.github\.io/);
  assert.match(bundle, /does not configure payment credentials/);
  const button = [...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].find(([, , inner]) => plainText(inner) === 'Copy install prompt');
  assert.ok(button);
  assert.doesNotMatch(button[1], /\bdisabled\b/);
});

test('copy works without a browser network request or reading stored settings', async (t) => {
  const copied = [];
  const fixture = panelHandlerFixture(await readFile(bundlePath, 'utf8'), async text => copied.push(text));
  t.after(() => fixture.cleanup());
  assert.equal(fixture.setup().disabled, false);
  await fixture.setup().onClick();
  fixture.render();
  assert.deepEqual(copied, [createOfficialInstallPrompt(['integration'])]);
  assert.ok(copied[0].startsWith('Antom Skill installation request v3.\n'));
  assert.match(copied[0], /Reuse .builder\/skills if it exists/);
  assert.match(copied[0], /Using only permitted native project file tools/);
  assert.doesNotMatch(copied[0], /npx|--registry|--agent claude-code|node --version/);
  assert.match(copied[0], /Do not invent tool names, run terminal commands, check runtime versions/);
  assert.equal(fixture.setup().children, 'Prompt copied');
  assert.ok(fixture.snackMessages[0].includes('Paste in Builder Agent'));
});

test('selection changes clear status; stale callbacks cannot copy a prior selection', async (t) => {
  const copied = [];
  const fixture = panelHandlerFixture(await readFile(bundlePath, 'utf8'), async text => copied.push(text));
  t.after(() => fixture.cleanup());
  const stale = fixture.setup().onClick;
  fixture.skill('integration').onChange();
  await stale();
  assert.equal(copied.length, 0);
  fixture.render();
  await fixture.setup().onClick();
  assert.equal(fixture.setup().disabled, true);
  assert.equal(copied.length, 0);
  fixture.render();
  fixture.skill('integration').onChange();
  fixture.render();
  await fixture.setup().onClick();
  assert.equal(copied[0], createOfficialInstallPrompt(['integration']));
  fixture.render();
  fixture.skill('integration').onChange();
  fixture.render();
  assert.equal(fixture.setup().disabled, true);
  await fixture.setup().onClick();
  assert.equal(copied.length, 1);
});

test('duplicate, example and selection events are locked during clipboard write', async (t) => {
  const copied = [];
  let finish;
  const fixture = panelHandlerFixture(await readFile(bundlePath, 'utf8'), text => {
    copied.push(text);
    return new Promise(resolve => { finish = resolve; });
  });
  t.after(() => fixture.cleanup());
  const example = fixture.button('Copy example').onClick;
  const pending = fixture.setup().onClick();
  await fixture.setup().onClick();
  await example();
  fixture.skill('integration').onChange();
  fixture.render();
  assert.equal(fixture.setup().disabled, true);
  assert.equal(fixture.skill('integration').checked, true);
  assert.equal(copied.length, 1);
  finish();
  await pending;
  fixture.render();
  assert.equal(fixture.setup().disabled, false);
});

test('clipboard denial shows same prompt for manual copy and clears it on selection change', async (t) => {
  const fixture = panelHandlerFixture(await readFile(bundlePath, 'utf8'), async () => { throw new Error('denied'); });
  t.after(() => fixture.cleanup());
  await fixture.setup().onClick();
  fixture.render();
  assert.equal(fixture.manualRequest().value, createOfficialInstallPrompt(['integration']));
  assert.equal(fixture.manualRequest().readOnly, true);
  assert.equal(fixture.setup().children, 'Copy install prompt');
  fixture.skill('integration').onChange();
  fixture.render();
  assert.equal(fixture.manualRequest(), null);
});

test('unmount discards late clipboard results without changing state or showing success', async () => {
  let finish;
  const fixture = panelHandlerFixture(await readFile(bundlePath, 'utf8'), () => new Promise(resolve => { finish = resolve; }));
  const pending = fixture.setup().onClick();
  fixture.cleanup();
  finish();
  await pending;
  assert.equal(fixture.updatesAfterUnmount(), 0);
  assert.equal(fixture.snackMessages.length, 0);
});

test('Usage guide opens locally and example copy does not imply installation', async (t) => {
  const copied = [];
  const fixture = panelHandlerFixture(await readFile(bundlePath, 'utf8'), async text => copied.push(text));
  t.after(() => fixture.cleanup());
  fixture.button('Usage guide').onClick();
  fixture.render();
  assert.equal(fixture.find(props => props.open === true && typeof props.onClose === 'function').open, true);
  await fixture.button('Copy example').onClick();
  fixture.render();
  assert.match(copied[0], /^Use antom-integration/);
  assert.equal(fixture.setup().children, 'Copy install prompt');
});
test('production bundle contains no local build paths or private-key material', async () => {
  const bundle = await readFile(bundlePath, 'utf8');
  assert.doesNotMatch(bundle, /\/Users\//);
  assert.doesNotMatch(bundle, /\/home\//);
  assert.doesNotMatch(bundle, /[A-Za-z]:\\\\Users\\\\/);
  assert.doesNotMatch(bundle, /__source/);
  assert.doesNotMatch(bundle, /__self/);
  assert.doesNotMatch(bundle, /-----BEGIN PRIVATE KEY-----/);
});
