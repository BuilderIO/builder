import { Button } from '../../src/components/button';
import { el } from '../modules/helpers';

const getButtonCode = (options: any): string =>
  Button(
    el({
      component: {
        options,
        name: 'Core:Button',
      },
    }),
    {}
  );

describe('Button code generator', () => {
  test('without link', () => {
    const code = getButtonCode({
      text: 'Click me',
    });

    expect(code).toMatchSnapshot();
  });

  test('with link', () => {
    const code = getButtonCode({
      text: 'Click me',
      link: true,
    });

    expect(code).toMatchSnapshot();
  });

  test('with link in new tab, no text', () => {
    const code = getButtonCode({
      link: true,
      openLinkInNewTab: true,
    });

    expect(code).toMatchSnapshot();
  });
});
