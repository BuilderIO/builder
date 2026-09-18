/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { act, render } from '@testing-library/react';
import type { BuilderElement } from '@builder.io/sdk';
import type { CustomCode as CustomCodeComponent } from './CustomCode';

declare global {
  interface Window {
    __ccRuns?: number;
  }
}

// jsdom does not implement innerText, which is what CustomCode reads to eval inline scripts.
if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText')) {
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    configurable: true,
    get(this: HTMLElement) {
      return this.textContent;
    },
  });
}

const BLOCK_ID = 'builder-custom-code-hydration';
const REMOTE_SCRIPT_SRC = 'https://example.com/custom-code.js';

const builderBlock: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  id: BLOCK_ID,
};

const CODE = [
  '<div class="cc-body">hello</div>',
  '<script>window.__ccRuns = (window.__ccRuns || 0) + 1;</script>',
  `<script src="${REMOTE_SCRIPT_SRC}"></script>`,
].join('');

/**
 * CustomCode collects the SSR'd nodes at module scope, so it has to be loaded after the markup
 * it is meant to hydrate is already in the document.
 */
function loadCustomCode() {
  jest.resetModules();
  const sdk = require('@builder.io/sdk') as typeof import('@builder.io/sdk');
  const blockModule = require('./CustomCode') as {
    CustomCode: typeof CustomCodeComponent;
  };
  return { Builder: sdk.Builder, CustomCode: blockModule.CustomCode };
}

function customCodeTree(CustomCode: typeof CustomCodeComponent) {
  return (
    <div builder-id={BLOCK_ID} className={BLOCK_ID}>
      <CustomCode code={CODE} scriptsClientOnly builderBlock={builderBlock} />
    </div>
  );
}

function renderSsrMarkup() {
  const { Builder, CustomCode } = loadCustomCode();
  Builder.isServer = true;
  try {
    return { markup: renderToString(customCodeTree(CustomCode)), CustomCode };
  } finally {
    Builder.isServer = false;
  }
}

function mountSsrMarkup(markup: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  return container;
}

async function flushNextTick() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

describe('CustomCode scriptsClientOnly hydration', () => {
  beforeEach(() => {
    delete window.__ccRuns;
    document.body.innerHTML = '';
    document.head.querySelectorAll(`script[src="${REMOTE_SCRIPT_SRC}"]`).forEach(el => el.remove());
  });

  it('strips scripts from the server render', () => {
    const { markup } = renderSsrMarkup();
    expect(markup).toContain('cc-body');
    expect(markup).not.toContain('__ccRuns');
    expect(markup).not.toContain(REMOTE_SCRIPT_SRC);
  });

  it('restores and runs the stripped scripts after hydration', async () => {
    const { markup } = renderSsrMarkup();
    const container = mountSsrMarkup(markup);

    const { CustomCode } = loadCustomCode();
    render(customCodeTree(CustomCode), { container, hydrate: true });
    await flushNextTick();

    const customCodeEl = container.querySelector('.builder-custom-code');
    expect(customCodeEl).toBeTruthy();

    // The re-render triggered by `hydrated` must put the stripped <script> tags back in the DOM.
    expect(customCodeEl!.querySelector('script')).toBeTruthy();
    // ...and findAndRunScripts must then pick them up.
    expect(window.__ccRuns).toBe(1);
    expect(document.head.querySelector(`script[src="${REMOTE_SCRIPT_SRC}"]`)).toBeTruthy();
  });

  // Bundlers load the SDK chunk asynchronously, so the module-scope `.builder-custom-code` scan
  // can run before the SSR'd markup is in the document. `originalRef` then stays null and the
  // block must still recover, which is the reported Next.js App Router failure.
  it('restores and runs the scripts when the module loads before the SSR markup exists', async () => {
    const { markup, CustomCode } = renderSsrMarkup();
    const container = mountSsrMarkup(markup);

    render(customCodeTree(CustomCode), { container, hydrate: true });
    await flushNextTick();

    const customCodeEl = container.querySelector('.builder-custom-code');
    expect(customCodeEl!.querySelector('script')).toBeTruthy();
    expect(window.__ccRuns).toBe(1);
    expect(document.head.querySelector(`script[src="${REMOTE_SCRIPT_SRC}"]`)).toBeTruthy();
  });

  it('still skips re-renders when neither code nor hydration state change', async () => {
    const { CustomCode } = loadCustomCode();
    const renderSpy = jest.spyOn(CustomCode.prototype, 'render');

    function Parent({ label }: { label: string }) {
      return (
        <div>
          <span>{label}</span>
          <CustomCode code={CODE} scriptsClientOnly builderBlock={builderBlock} />
        </div>
      );
    }

    const { rerender } = render(<Parent label="a" />);
    await flushNextTick();

    const rendersAfterMount = renderSpy.mock.calls.length;

    rerender(<Parent label="b" />);
    await flushNextTick();

    expect(renderSpy.mock.calls.length).toBe(rendersAfterMount);
    renderSpy.mockRestore();
  });
});
