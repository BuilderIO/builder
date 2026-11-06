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
    '<div class="css-shared">French<style data-emotion-css="shared" nonce="test-nonce">.css-shared{display:flex;padding:40px}</style></div>';
  templates[1].innerHTML = '<div class="css-shared">Catalan</div>';
  const script = document.getElementById(`variants-script-${blockId}`)!;
  script.parentNode!.appendChild(document.createTextNode('English'));
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
    const style = document.head.querySelector('style[data-emotion-css="shared"]');
    expect(style).not.toBeNull();
    expect(style!.textContent).toBe('.css-shared{display:flex;padding:40px}');
    expect(style!.getAttribute('nonce')).toBe('test-nonce');
    expect(document.querySelector('template')).toBeNull();
    ['French', 'Catalan', 'English']
      .filter(value => value !== content)
      .forEach(value => {
        expect(document.body.textContent).not.toContain(value);
      });
    dom.window.close();
  });
});
