import { expect } from '@playwright/test';
import {
  COLUMNS_WITH_NEW_SPACE,
  COLUMNS_WITH_NEW_TEXT,
  COLUMNS_WITH_NEW_WIDTHS,
} from '../specs/columns.js';
import { NEW_TEXT } from '../specs/helpers.js';
import { HOMEPAGE } from '../specs/homepage.js';
import { checkIsRN, test } from '../helpers/index.js';
import {
  cloneContent,
  launchEmbedderAndWaitForSdk,
  sendContentUpdateMessage,
  sendPatchOrUpdateMessage,
} from '../helpers/visual-editor.js';
import { MODIFIED_EDITING_COLUMNS } from '../specs/editing-columns-inner-layout.js';
import { ADD_A_TEXT_BLOCK } from '../specs/duplicated-content-using-nested-symbols.js';
import { EDITING_STYLES } from '../specs/editing-styles.js';
import { ACCORDION_WITH_NO_DETAIL } from '../specs/accordion.js';

const editorTests = ({
  noTrustedHosts,
  editorIsInViewPort,
}: {
  noTrustedHosts: boolean;
  editorIsInViewPort?: boolean;
}) => {
  test('correctly updates Text block', async ({ page, basePort, packageName, sdk }) => {
    test.skip(
      packageName === 'nextjs-sdk-next-app' ||
        packageName === 'gen1-next14-pages' ||
        packageName === 'gen1-next15-app' ||
        packageName === 'gen1-remix'
    );

    if (!editorIsInViewPort) {
      test.skip(sdk !== 'qwik', 'This is Qwik only test');
    }

    await launchEmbedderAndWaitForSdk({
      path: noTrustedHosts
        ? '/no-trusted-hosts'
        : editorIsInViewPort
          ? '/editing'
          : '/editing-with-top-padding',
      basePort,
      page,
      sdk,
    });

    await expect(
      page.frameLocator('iframe').getByText('SDK Feature testing project')
    ).toBeVisible();

    await sendPatchOrUpdateMessage({
      page,
      content: cloneContent(HOMEPAGE),
      model: 'page',
      sdk,
      path: '/data/blocks/0/children/0/component/options/text',
      updateFn: () => 'foo-bar-new-text',
    });

    await expect(page.frameLocator('iframe').getByText('foo-bar-new-text')).toBeVisible();
  });

  test('correctly updates Text block styles', async ({ page, packageName, basePort, sdk }) => {
    test.skip(
      packageName === 'nextjs-sdk-next-app' ||
        packageName === 'gen1-next14-pages' ||
        packageName === 'gen1-next15-app' ||
        packageName === 'gen1-remix'
    );

    await launchEmbedderAndWaitForSdk({
      path: noTrustedHosts ? '/editing-styles-no-trusted-hosts' : '/editing-styles',
      basePort,
      page,
      sdk,
    });
    const btn1 = page.frameLocator('iframe').getByRole(sdk === 'oldReact' ? 'button' : 'link');
    await expect(btn1).toHaveCSS('background-color', 'rgb(184, 35, 35)');

    await sendPatchOrUpdateMessage({
      page,
      content: cloneContent(EDITING_STYLES),
      model: 'page',
      sdk,
      path: '/data/blocks/0/responsiveStyles/large/backgroundColor',
      updateFn: () => 'rgb(19, 67, 92)',
    });

    const btn = page.frameLocator('iframe').getByRole(sdk === 'oldReact' ? 'button' : 'link');
    await expect(btn).toHaveCSS('background-color', 'rgb(19, 67, 92)');
  });
};

test.describe('Visual Editing', () => {
  editorTests({ noTrustedHosts: false, editorIsInViewPort: false });
  test('correctly updates Box -> Columns when used Inner Layout > Columns option', async ({
    page,
    packageName,
    basePort,
    sdk,
  }) => {
    test.skip(
      packageName === 'nextjs-sdk-next-app' ||
        packageName === 'gen1-next14-pages' ||
        packageName === 'gen1-next15-app' ||
        packageName === 'gen1-react' ||
        packageName === 'gen1-remix'
    );

    await launchEmbedderAndWaitForSdk({
      path: '/editing-box-columns-inner-layout',
      basePort,
      page,
      sdk,
    });

    const firstText = page.frameLocator('iframe').getByText('first');
    const secondText = page.frameLocator('iframe').getByText('second');
    await expect(firstText).toBeVisible();
    await expect(secondText).toBeVisible();
    const firstBox = await firstText.boundingBox();
    const secondBox = await secondText.boundingBox();
    if (firstBox && secondBox) {
      expect(firstBox.y).toBeLessThan(secondBox.y);
    }

    await sendContentUpdateMessage({ page, newContent: MODIFIED_EDITING_COLUMNS, model: 'page' });
    // had to hack this so that we can wait for the content update to actually show up (was failing in Qwik)
    await page.frameLocator('iframe').getByText('third').waitFor();

    const updatedFirstText = page.frameLocator('iframe').getByText('third');
    await expect(updatedFirstText).toBeVisible();
    await expect(secondText).toBeVisible();
    const updatedFirstBox = await updatedFirstText.boundingBox();
    const updatedSecondBox = await secondText.boundingBox();
    if (updatedFirstBox && updatedSecondBox) {
      if (checkIsRN(sdk)) {
        // stack layout incase of RN SDK
        expect(updatedFirstBox.x).toBe(updatedSecondBox.x);
        expect(updatedFirstBox.y).toBeLessThan(updatedSecondBox.y);
      } else {
        expect(updatedFirstBox.x).toBeLessThan(updatedSecondBox.x);
        expect(updatedFirstBox.y).toBe(updatedSecondBox.y);
      }
    }
  });

  test('nested ContentVariants with same model name should not duplicate content', async ({
    page,
    packageName,
    basePort,
    sdk,
  }) => {
    test.skip(
      packageName === 'nextjs-sdk-next-app' ||
        packageName === 'gen1-next14-pages' ||
        packageName === 'gen1-next15-app' ||
        packageName === 'gen1-react' ||
        packageName === 'gen1-remix'
    );

    test.skip(packageName === 'vue', 'Vue tests flake on this one for an unnkown reason.');

    await page.goto('/duplicated-content-using-nested-symbols');
    await launchEmbedderAndWaitForSdk({
      path: '/duplicated-content-using-nested-symbols',
      basePort,
      page,
      sdk,
    });

    await sendContentUpdateMessage({
      page,
      newContent: ADD_A_TEXT_BLOCK,
      model: 'symbol',
    });

    await page.frameLocator('iframe').getByText('something other than the symbol!').waitFor();

    const textBlocks = await page
      .frameLocator('iframe')
      .getByText('something other than the symbol!')
      .all();
    expect(textBlocks.length).toBe(1);
  });

  test.describe('Column block', () => {
    test('correctly updates nested Text block', async ({ page, basePort, packageName, sdk }) => {
      test.skip(
        packageName === 'nextjs-sdk-next-app' ||
          packageName === 'gen1-next14-pages' ||
          packageName === 'gen1-next15-app' ||
          packageName === 'gen1-react' ||
          packageName === 'gen1-remix'
      );

      await launchEmbedderAndWaitForSdk({ path: '/columns', basePort, page, sdk });
      await sendContentUpdateMessage({ page, newContent: COLUMNS_WITH_NEW_TEXT, model: 'page' });
      await page.frameLocator('iframe').getByText(NEW_TEXT).waitFor();
    });
    test('correctly updates space prop', async ({ page, basePort, packageName, sdk }) => {
      test.skip(
        packageName === 'nextjs-sdk-next-app' ||
          packageName === 'gen1-next14-pages' ||
          packageName === 'gen1-next15-app' ||
          packageName === 'gen1-react' ||
          packageName === 'gen1-remix'
      );

      const selector = checkIsRN(sdk)
        ? '[data-builder-block-name=builder-column]'
        : '.builder-column';
      await launchEmbedderAndWaitForSdk({ path: '/columns', basePort, page, sdk });
      const secondColumn = page.frameLocator('iframe').locator(selector).nth(1);

      await expect(secondColumn).toHaveCSS('margin-left', checkIsRN(sdk) ? '0px' : '20px');
      await sendContentUpdateMessage({ page, newContent: COLUMNS_WITH_NEW_SPACE, model: 'page' });
      await expect(secondColumn).toHaveCSS('margin-left', '10px');
    });
    test('correctly updates width props', async ({ page, basePort, packageName, sdk }) => {
      test.skip(
        packageName === 'react-native-74' ||
          packageName === 'react-native-76-fabric' ||
          packageName === 'nextjs-sdk-next-app' ||
          packageName === 'gen1-next14-pages' ||
          packageName === 'gen1-next15-app' ||
          packageName === 'gen1-react' ||
          packageName === 'gen1-remix'
      );

      await launchEmbedderAndWaitForSdk({ path: '/columns', basePort, page, sdk });
      const secondColumn = page.frameLocator('iframe').locator('.builder-column').nth(1);

      const initialWidth = await secondColumn.evaluate(el =>
        getComputedStyle(el).width.replace('px', '')
      );

      await sendContentUpdateMessage({ page, newContent: COLUMNS_WITH_NEW_WIDTHS, model: 'page' });

      await expect
        .poll(
          async () => {
            const currentWidth = await secondColumn.evaluate(el =>
              getComputedStyle(el).width.replace('px', '')
            );
            return Number(currentWidth);
          },
          {
            message: 'Waiting for column width to increase',
            timeout: 5000,
          }
        )
        .toBeGreaterThan(Number(initialWidth));
    });
  });

  test.describe('Accordion block', () => {
    test('inserting a new detail item adds it to the correct place in the accordion', async ({
      page,
      sdk,
      basePort,
      packageName,
    }) => {
      test.skip(
        packageName === 'nextjs-sdk-next-app' ||
          packageName === 'gen1-next14-pages' ||
          packageName === 'gen1-next15-app' ||
          packageName === 'gen1-react' ||
          packageName === 'gen1-remix'
      );
      await launchEmbedderAndWaitForSdk({ path: '/accordion-no-detail', basePort, page, sdk });

      const item1 = page.frameLocator('iframe').getByText('Item 1');
      const NEW_DETAILS_TEXT = 'new detail';

      await item1.click();

      await expect(page.frameLocator('iframe').getByText(NEW_DETAILS_TEXT)).not.toBeVisible();

      // reset
      await item1.click();

      const accordion = cloneContent(ACCORDION_WITH_NO_DETAIL);

      // insert new detail item
      accordion.data.blocks[0].component.options.items[0].detail = [
        {
          id: 'some-random-id',
          component: {
            name: 'Text',
            options: { text: NEW_DETAILS_TEXT },
          },
        },
      ];

      await sendContentUpdateMessage({
        page,
        newContent: accordion,
        model: 'page',
      });

      await item1.click();

      const detailElement = page.frameLocator('iframe').getByText(NEW_DETAILS_TEXT);
      await detailElement.waitFor();

      const [titleBox, detailBox] = await Promise.all([
        item1.boundingBox(),
        detailElement.boundingBox(),
      ]);

      if (!titleBox || !detailBox) {
        throw new Error('Title or detail box not found');
      }

      expect(detailBox.y).toBeGreaterThan(titleBox.y);
    });
  });

  test.describe('fails for empty trusted hosts', () => {
    test.fail();
    editorTests({ noTrustedHosts: true });
  });

  test.describe('Data Models', () => {
    test('correctly updates', async ({ page, packageName, basePort, sdk }) => {
      test.skip(packageName !== 'react', 'This test is only implemented for React');

      await launchEmbedderAndWaitForSdk({ path: '/data-preview', basePort, page, sdk });

      await page.frameLocator('iframe').getByText('coffee name: Epoch Chemistry').waitFor();
      await page.frameLocator('iframe').getByText('coffee info: Local coffee brand.').waitFor();
      await sendContentUpdateMessage({
        page,
        newContent: {
          data: { name: 'Anchored Coffee', info: 'Another coffee brand.' },
        },
        model: 'coffee',
      });
      await page.frameLocator('iframe').getByText('coffee name: Anchored Coffee').waitFor();
      await page.frameLocator('iframe').getByText('coffee info: Another coffee brand.').waitFor();
    });
  });
});
