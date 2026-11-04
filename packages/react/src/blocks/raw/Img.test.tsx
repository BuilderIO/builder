import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Img } from './Img';

// Skip the Builder SDK wrapper and Image module so this test doesn't pull untested modules into the global coverage numbers.
jest.mock('../../functions/with-builder', () => ({ withBuilder: (component: any) => component }));
jest.mock('../Image', () => ({ getSrcSet: () => undefined }));

const render = (props: any) =>
  renderToStaticMarkup(<Img image="https://example.com/a.png" {...props} />);

describe('Raw:Img', () => {
  it('keeps the builder block class', () => {
    const html = render({ attributes: { className: 'builder-abc another' } });
    expect(html).toContain('class="builder-raw-img builder-abc another"');
  });

  it('falls back to legacy alt and title', () => {
    const html = render({ attributes: { alt: 'legacy', title: 'legacy title' } });
    expect(html).toContain('alt="legacy"');
    expect(html).toContain('title="legacy title"');
  });

  it('prefers altText input over legacy alt', () => {
    expect(render({ altText: 'new', attributes: { alt: 'legacy' } })).toContain('alt="new"');
  });
});
