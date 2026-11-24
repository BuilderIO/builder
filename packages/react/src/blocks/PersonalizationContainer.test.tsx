import React, { useId, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { act, create } from 'react-test-renderer';
import { Builder, builder } from '@builder.io/sdk';
import { PersonalizationContainer } from './PersonalizationContainer';

jest.mock('../components/builder-blocks.component', () => ({
  BuilderBlocks: ({ blocks }: any) => <>{blocks}</>,
}));

function Probe({ branch }: { branch: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        data-branch={branch}
        aria-controls={id}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen(true)}
      >
        Open
      </button>
      <p id={id}>Answer</p>
    </>
  );
}

['first', 'second', 'fallback'].forEach(selected =>
  test(`preserves useId when hydrating ${selected}`, async () => {
    builder.setUserAttributes({ locale: 'en-GB' });
    const fixture = (
      <PersonalizationContainer
        attributes={{}}
        builderBlock={{
          '@type': '@builder.io/sdk:Element',
          id: 'use-id-test',
          children: [<Probe key="fallback" branch="fallback" />] as any,
        }}
        builderState={{ state: { locale: 'en-GB' } }}
        previewingIndex={null}
        variants={
          ['first', 'second'].map(name => ({
            query: [
              { property: 'locale', operator: 'is', value: name === selected ? 'en-GB' : 'fr-FR' },
            ],
            blocks: [<Probe key={name} branch={name} />],
          })) as any
        }
      >
        {null}
      </PersonalizationContainer>
    );
    const html = renderToString(fixture);
    const dom = new JSDOM(`<div id="root">${html}</div>`, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });
    const globals = global as any;
    const original = {
      window: globals.window,
      document: globals.document,
      CustomEvent: globals.CustomEvent,
      IntersectionObserver: globals.IntersectionObserver,
      IS_REACT_ACT_ENVIRONMENT: globals.IS_REACT_ACT_ENVIRONMENT,
    };
    const flags = { isServer: Builder.isServer, isBrowser: Builder.isBrowser };
    Object.assign(global, {
      window: dom.window,
      document: dom.window.document,
      CustomEvent: dom.window.CustomEvent,
      IS_REACT_ACT_ENVIRONMENT: true,
      IntersectionObserver: class {
        observe() {}
        disconnect() {}
      },
    });
    Builder.isServer = false;
    Builder.isBrowser = true;
    const { hydrateRoot } = require('react-dom/client');
    const { act } = require('react-dom/test-utils');
    const container = document.getElementById('root')!;
    let root: any;
    const errors = jest.spyOn(console, 'error');
    try {
      const serverButton = container.querySelector('button')!;
      expect(serverButton).toHaveAttribute('data-branch', selected);
      const serverId = serverButton.getAttribute('aria-controls')!;
      const serverTarget = document.getElementById(serverId);
      expect(serverTarget).not.toBeNull();

      await act(async () => {
        root = hydrateRoot(container, fixture);
      });
      expect(container.querySelector('button')).toBe(serverButton);
      await act(async () => {
        serverButton.click();
      });
      expect(serverButton).toHaveAttribute('aria-describedby', serverId);
      expect(document.getElementById(serverId)).toBe(serverTarget);
      expect(errors).not.toHaveBeenCalled();
      // User attributes can change after hydration without leaving stale ID links.
      await act(async () => {
        builder.setUserAttributes({ locale: selected === 'fallback' ? 'fr-FR' : 'zz-ZZ' });
      });
      const switchedButton = container.querySelector('button')!;
      expect(switchedButton).toHaveAttribute(
        'data-branch',
        selected === 'fallback' ? 'first' : 'fallback'
      );
      await act(async () => {
        switchedButton.click();
      });
      expect(
        document.getElementById(switchedButton.getAttribute('aria-describedby')!)
      ).not.toBeNull();
      expect(errors).not.toHaveBeenCalled();
    } finally {
      if (root) await act(async () => root.unmount());
      Object.assign(Builder, flags);
      Object.assign(global, original);
      builder.setUserAttributes({ locale: undefined });
      errors.mockRestore();
      dom.window.close();
    }
  })
);

[
  { previewingIndex: null, expected: 'fallback' },
  { previewingIndex: 1, expected: 'preview' },
  { previewingIndex: 2, expected: 'matched' },
].forEach(({ previewingIndex, expected }) => {
  test(`shows ${expected} in the editor with preview index ${previewingIndex}`, () => {
    const flags = { isServer: Builder.isServer, isEditing: Builder.isEditing };
    const { locale } = builder.getUserAttributes();
    Builder.isServer = false;
    Builder.isEditing = true;
    let root: ReturnType<typeof create> | undefined;

    try {
      builder.setUserAttributes({ locale: 'en-GB' });
      act(() => {
        root = create(
          <PersonalizationContainer
            attributes={{}}
            builderBlock={{
              '@type': '@builder.io/sdk:Element',
              id: 'editor-preview-test',
              children: [<span key="fallback">fallback</span>] as any,
            }}
            builderState={{ state: { locale: 'en-GB' } }}
            previewingIndex={previewingIndex}
            variants={
              [
                { query: [], blocks: [<span key="matched">matched</span>] },
                {
                  query: [{ property: 'locale', operator: 'is', value: 'fr-FR' }],
                  blocks: [<span key="preview">preview</span>],
                },
              ] as any
            }
          >
            {null}
          </PersonalizationContainer>
        );
      });
      expect(root!.root.findByType('span').children).toEqual([expected]);
    } finally {
      if (root) act(() => root!.unmount());
      Object.assign(Builder, flags);
      builder.setUserAttributes({ locale });
    }
  });
});
