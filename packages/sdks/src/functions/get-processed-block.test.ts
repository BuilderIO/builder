import type { BuilderBlock } from '../types/builder-block.js';
import { getProcessedBlock } from './get-processed-block.js';

test('Can process bindings', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    properties: {
      foo: 'bar',
    },
    bindings: {
      'properties.foo': '"baz"',
      'responsiveStyles.large.zIndex': '1 + 1',
      'properties.test': 'state.test',
      'properties.block': `
        var foo = 'bar';
        return foo;
      `,
      'properties.isEditing': 'builder.isEditing',
    },
  };
  const processed = getProcessedBlock({
    block,
    context: {},
    rootState: { test: 'hello' },
    rootSetState: undefined,
    localState: undefined,
  });
  expect(processed).not.toEqual(block);
  expect(processed.properties?.foo).toEqual('baz');
  expect(processed.properties?.test).toEqual('hello');
  expect(processed.properties?.block).toEqual('bar');
  expect(processed.properties?.isEditing).toEqual(false);
  expect(processed.responsiveStyles?.large?.zIndex).toEqual(2);
});

test('A bound `id` sets the element id and keeps the block id', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    id: 'builder-abc',
    bindings: {
      id: '"slide-".concat(state.$index)',
    },
  };
  const processed = getProcessedBlock({
    block,
    context: {},
    rootState: {},
    rootSetState: undefined,
    localState: { $index: 2 },
  });
  expect(processed.id).toEqual('builder-abc');
  expect(processed.properties?.id).toEqual('slide-2');
});

test('Can process localized bindings', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    bindings: {
      'component.options.text':
        'var _virtual_index=state.listData.data.title;return _virtual_index',
    },
    component: {
      name: 'Text',
      options: {
        text: 'Enter some text...',
      },
    },
  };

  const rootState = {
    deviceSize: 'large',
    listData: {
      data: {
        title: {
          Default: 'default title',
          '@type': '@builder.io/core:LocalizedValue',
          'en-US': 'en-US title',
          'en-IN': 'en-IN title',
        },
      },
    },
    locale: 'en-US',
  };
  const processed = getProcessedBlock({
    block,
    context: {},
    rootState,
    rootSetState: undefined,
    localState: undefined,
  });

  expect(processed.component?.options.text).toEqual('en-US title');
});

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const localized = (values: Record<string, string>) => ({
  '@type': '@builder.io/core:LocalizedValue',
  ...values,
});

test('Never mutates the block, its children, or the state it reads', () => {
  const child: BuilderBlock = { '@type': '@builder.io/sdk:Element', id: 'c' };
  const rootState = {
    items: [{ title: localized({ Default: 'd', fr: 'bonjour' }) }],
    total: 1,
    locale: 'fr',
  };
  const rootStateSnapshot = JSON.parse(JSON.stringify(rootState));
  const block: BuilderBlock = deepFreeze({
    '@type': '@builder.io/sdk:Element',
    id: 'b',
    children: [child],
    responsiveStyles: { large: { color: 'red' } },
    component: {
      name: 'Custom',
      options: {
        keep: { nested: true },
        heading: localized({ Default: 'hello', fr: 'salut' }),
      },
    },
    bindings: {
      'component.options.items': 'state.items',
      'component.options.count': 'state.total + 1',
      'responsiveStyles.large.zIndex': '2',
      'properties.href': '"/x"',
    },
  });

  const processed = getProcessedBlock({
    block,
    context: {},
    rootState,
    rootSetState: undefined,
    localState: undefined,
  });

  expect(processed.component?.options.items[0].title).toBe('bonjour');
  expect(processed.component?.options.heading).toBe('salut');
  expect(processed.component?.options.count).toBe(2);
  expect(processed.component?.options.keep).toBe(block.component?.options.keep);
  expect(processed.responsiveStyles?.large?.zIndex).toBe(2);
  expect(processed.responsiveStyles?.large?.color).toBe('red');
  expect(processed.properties?.href).toBe('/x');
  expect(processed.children?.[0]).toBe(child);
  expect(block.responsiveStyles?.large).toEqual({ color: 'red' });
  expect(rootState).toEqual(rootStateSnapshot);
});

test('Resolves each locale correctly when the same content is rendered again', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    component: {
      name: 'Text',
      options: { text: localized({ Default: 'hi', fr: 'bonjour' }) },
    },
  };
  const process = (locale: string) =>
    getProcessedBlock({
      block,
      context: {},
      rootState: { locale },
      rootSetState: undefined,
      localState: undefined,
    });

  expect(process('fr').component?.options.text).toBe('bonjour');
  expect(process('Default').component?.options.text).toBe('hi');
  expect(process('fr')).toBe(process('fr'));
});

test('Re-evaluates bound blocks on every call', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    bindings: { 'component.options.text': 'state.text' },
    component: { name: 'Text', options: {} },
  };
  const process = (text: string) =>
    getProcessedBlock({
      block,
      context: {},
      rootState: { text },
      rootSetState: undefined,
      localState: undefined,
    }).component?.options.text;

  expect(process('a')).toBe('a');
  expect(process('b')).toBe('b');
  expect(block.component?.options.text).toBeUndefined();
});

test('A second locale replaces the cached slot and still resolves correctly', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    component: {
      name: 'Text',
      options: {
        text: localized({ Default: 'hi', fr: 'bonjour', de: 'hallo' }),
      },
    },
  };
  const process = (locale: string) =>
    getProcessedBlock({
      block,
      context: {},
      rootState: { locale },
      rootSetState: undefined,
      localState: undefined,
    });

  const fr = process('fr');
  const de = process('de');
  expect(de.component?.options.text).toBe('hallo');
  expect(process('de')).toBe(de);
  const frAgain = process('fr');
  expect(frAgain).not.toBe(fr);
  expect(frAgain.component?.options.text).toBe('bonjour');
});
