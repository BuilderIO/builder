import React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { PersonalizationContainer } from '../src/blocks/PersonalizationContainer';

const blockId = 'personalization-styles';

const createDocument = (locale: string) => {
  const html = renderToString(
    <PersonalizationContainer
      attributes={{}}
      builderBlock={{ '@type': '@builder.io/sdk:Element', id: blockId, children: [] }}
      builderState={{ state: {} }}
      previewingIndex={null}
      variants={
        [
          { query: [{ property: 'locale', operator: 'is', value: 'fr-FR' }], blocks: [] },
          { query: [{ property: 'locale', operator: 'is', value: 'ca-ES' }], blocks: [] },
        ] as any
      }
    >
      {null}
    </PersonalizationContainer>
  );
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only' });
  const document = dom.window.document;
  const templates = document.querySelectorAll('template');
  templates[0].innerHTML =
    '<div class="css-shared css-french-only">French' +
    '<style data-emotion-css="shared animation-shared" nonce="test-nonce">.css-shared{display:flex;padding:40px;animation:animation-shared 1s}@keyframes animation-shared{to{opacity:1}}</style>' +
    '<style data-emotion-css="french-only">.css-french-only{color:red}</style>' +
    '<style data-emotion-css="global-french">body{background:red}</style></div>';
  templates[1].innerHTML =
    '<div class="css-shared css-catalan-only">Catalan' +
    '<style data-emotion-css="catalan-only">.css-catalan-only{color:blue}</style>' +
    '<style data-emotion-css="global-catalan">body{background:blue}</style></div>';
  const script = document.getElementById(`variants-script-${blockId}`)!;
  const defaultContent = document.querySelector(
    '.builder-personalization-container > .builder-blocks'
  )!;
  expect(
    defaultContent.compareDocumentPosition(script) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  defaultContent.innerHTML = '<div class="css-shared">English</div>';
  document.cookie = `builder.userAttributes=${JSON.stringify({ locale })}`;
  dom.window.eval(script.textContent!);
  return dom;
};

describe('personalization SSR shared styles', () => {
  test.each([
    ['fr-FR', 'French'],
    ['ca-ES', 'Catalan'],
    ['en-US', 'English'],
  ])('preserves shared rules when %s wins without hydration', (locale, content) => {
    const dom = createDocument(locale);
    const document = dom.window.document;
    expect(document.body.textContent).toContain(content);
    const style = document.querySelector('style[data-emotion-css="shared animation-shared"]');
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain('.css-shared{display:flex;padding:40px;');
    expect(style!.textContent).toContain('@keyframes animation-shared');
    expect(style!.getAttribute('nonce')).toBe('test-nonce');
    expect(document.querySelector('template')).toBeNull();
    ['french', 'catalan'].forEach((variant, index) => {
      const isSelected = locale === ['fr-FR', 'ca-ES'][index];
      expect(Boolean(document.querySelector(`style[data-emotion-css="${variant}-only"]`))).toBe(
        isSelected
      );
      expect(Boolean(document.querySelector(`style[data-emotion-css="global-${variant}"]`))).toBe(
        isSelected
      );
    });
    ['French', 'Catalan', 'English']
      .filter(value => value !== content)
      .forEach(value => {
        expect(document.body.textContent).not.toContain(value);
      });
    dom.window.close();
  });
});
