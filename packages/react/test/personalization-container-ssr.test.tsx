import React from 'react';
import { renderToString } from 'react-dom/server';
import { CacheProvider, ClassNames, Global, keyframes } from '@emotion/core';
import createCache from '@emotion/cache';
import { JSDOM, CookieJar } from 'jsdom';
import { PersonalizationContainer } from '../src/blocks/PersonalizationContainer';

const blockId = 'personalization-styles';
const animation = keyframes({ to: { opacity: 1 } });
const sharedStyles = { display: 'flex', padding: 40, animation: `${animation} 1s` };

const VariantContent = ({ name }: { name: string }) => (
  <ClassNames>
    {({ css }) => {
      const className = css(sharedStyles);
      css({ '@font-face': { fontFamily: `variant-${name}`, src: `url('/${name}.woff2')` } });
      return (
        <div className={className}>
          <Global styles={{ body: { '--selected-variant': name } }} />
          <span data-content={name}>{name}</span>
        </div>
      );
    }}
  </ClassNames>
);

const renderFixture = (key = 'css', compat = false) => {
  const cache = createCache({ key, nonce: 'test-nonce' });
  if (compat) cache.compat = true;
  const html = renderToString(
    <CacheProvider value={cache}>
      <PersonalizationContainer
        attributes={{}}
        builderBlock={{
          '@type': '@builder.io/sdk:Element',
          id: blockId,
          children: [<VariantContent key="default" name="English" />] as any,
        }}
        builderState={{ state: {} }}
        previewingIndex={null}
        variants={
          [
            {
              query: [{ property: 'locale', operator: 'is', value: 'fr-FR' }],
              blocks: [<VariantContent key="fr" name="French" />],
            },
            {
              query: [{ property: 'locale', operator: 'is', value: 'ca-ES' }],
              blocks: [<VariantContent key="ca" name="Catalan" />],
            },
          ] as any
        }
      >
        {null}
      </PersonalizationContainer>
    </CacheProvider>
  );
  return { html, cache };
};

const runInBrowser = (html: string, locale: string) => {
  const cookieJar = new CookieJar();
  cookieJar.setCookieSync(
    `builder.userAttributes=${JSON.stringify({ locale })}; Path=/`,
    'http://localhost/'
  );
  return new JSDOM(html, { url: 'http://localhost/', cookieJar, runScripts: 'dangerously' });
};

describe('personalization SSR shared styles', () => {
  test.each([
    { key: 'custom', compat: false },
    { key: 'css', compat: true },
  ])('preserves the parent cache configuration for $key with compat=$compat', ({ key, compat }) => {
    const { html, cache } = renderFixture(key, compat);
    expect(cache.inserted).toEqual({});
    expect(cache.registered).toEqual({});
    const dom = runInBrowser(html, 'ca-ES');
    const styles = Array.from(dom.window.document.querySelectorAll(`style[data-emotion-${key}]`));
    expect(styles.length).toBeGreaterThan(0);
    const rules = styles.map(style => style.textContent).join('');
    expect(rules).toContain('padding:40px');
    expect(rules).not.toContain('variant-French');
    styles.forEach(style => expect(style.getAttribute('nonce')).toBe('test-nonce'));
    dom.window.close();
  });

  test('Emotion groups shared styles and variant-only font rules in the same tag', () => {
    const { html } = renderFixture();
    const dom = new JSDOM(html);
    const template = dom.window.document.querySelector('template')!;
    const groupedStyle = Array.from(template.content.querySelectorAll('style')).find(style =>
      style.textContent!.includes('padding:40px')
    )!;
    expect(groupedStyle.textContent).toContain('@font-face');
    expect(groupedStyle.textContent).toContain('variant-French');
    dom.window.close();
  });

  test.each([
    ['fr-FR', 'French'],
    ['ca-ES', 'Catalan'],
    ['en-US', 'English'],
  ])('keeps only %s content and its styles without hydration', (locale, name) => {
    const { html } = renderFixture();
    const dom = runInBrowser(html, locale);
    const document = dom.window.document;
    const styles = Array.from(document.querySelectorAll('style[data-emotion-css]'));
    const rules = styles.map(style => style.textContent).join('');
    expect(document.querySelector('[data-content]')!.textContent).toBe(name);
    expect(document.querySelector('template')).toBeNull();
    expect(rules).toContain('padding:40px');
    expect(rules).toContain(`@keyframes ${animation.name}`);
    expect(rules).toContain(`variant-${name}`);
    expect(rules).toContain(`--selected-variant:${name}`);
    styles.forEach(style => expect(style.getAttribute('nonce')).toBe('test-nonce'));
    ['French', 'Catalan', 'English']
      .filter(value => value !== name)
      .forEach(value => {
        expect(rules).not.toContain(`variant-${value}`);
        expect(rules).not.toContain(`--selected-variant:${value}`);
        expect(document.querySelector(`[data-content="${value}"]`)).toBeNull();
      });
    dom.window.close();
  });
});
