import { expect } from '@playwright/test';
import { findTextInPage, test } from '../helpers/index.js';

test.describe('Editable regions in custom components', () => {
  test('should render a div with two columns with builder-path attr', async ({
    page,
    packageName,
  }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'gen1-next15-app',
        'angular-19-ssr',
        'gen1-next14-pages',
        'gen1-remix',
        'gen1-react',
        'nextjs-sdk-next-app',
      ].includes(packageName)
    );

    await page.goto('/editable-region');
    await page.waitForLoadState('networkidle');

    const divs = await page.$$('div[builder-path]');

    const count = divs.length;

    expect(count).toBe(2);
  });

  test('should render a div with two columns with placeholder text', async ({
    page,
    packageName,
  }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'gen1-next15-app',
        'angular-19-ssr',
        'gen1-next14-pages',
        'nextjs-sdk-next-app',
      ].includes(packageName)
    );

    await page.goto('/editable-region');

    const twoColumns = page.locator('div.builder-block').first();
    await expect(twoColumns).toBeVisible();

    const columnTexts = await twoColumns.textContent();
    expect(columnTexts).toContain('column 1 text');
    expect(columnTexts).toContain('column 2 text');
  });

  test('Editable regions show draft content in preview mode with isPreviewing', async ({
    page,
    packageName,
  }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'gen1-next15-app',
        'angular-19-ssr',
        'gen1-next14-pages',
        'gen1-remix',
        'gen1-react',
        'nextjs-sdk-next-app',
      ].includes(packageName)
    );

    await page.goto(
      '/editable-region?builder.space=ee9f13b4981e489a9a1209887695ef2b&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=bb909e043ad34915b0075091911647e8&builder.overrides.bb909e043ad34915b0075091911647e8=bb909e043ad34915b0075091911647e8&builder.overrides.page:/editable-region=bb909e043ad34915b0075091911647e8'
    );
    await findTextInPage({ page, text: 'draft: column 1 text' });
    await findTextInPage({ page, text: 'draft: column 2 text' });

    await page.waitForLoadState('networkidle');
  });
});
