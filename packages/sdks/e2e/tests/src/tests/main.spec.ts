import type { Locator, Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

import { targetContext } from './context.js';

// test.describe.configure({ mode: 'serial' });

const findTextInPage = ({ page, text }: { page: Page; text: string }) =>
  expect(page.locator(`text=${text}`)).toBeVisible();

const getElementStyleValue = async ({
  locator,
  cssProperty,
}: {
  locator: Locator;
  cssProperty: string;
}) => {
  return locator.evaluate(
    (e, cssProperty) => getComputedStyle(e).getPropertyValue(cssProperty),
    cssProperty
  );
};

test.describe(targetContext.name, () => {
  test('homepage', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a');
    await expect(links).toHaveCount(6);

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    expect(columnsLink).toHaveCount(1);
    await columnsLink.click();
    await findTextInPage({ page, text: 'Stack at tablet' });
  });
  test('columns', async ({ page }) => {
    await page.goto('/columns');

    await findTextInPage({ page, text: 'Stack at tablet' });
  });
  test('symbols', async ({ page }) => {
    await page.goto('/symbols');

    await findTextInPage({ page, text: 'special test description' });
    await page
      .locator(
        '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2"]'
      )
      .isVisible();
    await findTextInPage({ page, text: 'default description' });
    await page
      .locator(
        '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F4bce19c3d8f040b3a95e91000a98283e"]'
      )
      .isVisible();
  });
  test('data-bindings', async ({ page }) => {
    await page.goto('/data-bindings');

    await expect(page.locator(`text="1234"`).first()).toBeVisible();
    await findTextInPage({
      page,
      text: 'The Hot Wheels™ Legends Tour is Back',
    });
    await findTextInPage({
      page,
      text: 'Mattel Certified by Great Place to Work and Named to Fast Company’s List of 100 Best Workplaces for Innovators',
    });
  });

  test.describe('custom-breakpoints', () => {
    /* set breakpoint config in content -
    breakpoints: {
      small: 500,
      medium: 800,
    },
    */
    test.describe('when applied', () => {
      test('large desktop size', async ({ page }) => {
        page.setViewportSize({ width: 801, height: 1000 });

        await page.goto('/custom-breakpoints');
        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        let expectedTextColor = 'rgb(0, 0, 0)'; // black text color
        if (process.env.SDK === 'reactNative') {
          expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe(expectedTextColor);
      });

      test('medium tablet size', async ({ page }) => {
        page.setViewportSize({ width: 501, height: 1000 });

        await page.goto('/custom-breakpoints');
        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        let expectedTextColor = 'rgb(208, 2, 27)'; // reddish text color
        if (process.env.SDK === 'reactNative') {
          expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe(expectedTextColor);
      });

      test('small mobile size', async ({ page }) => {
        page.setViewportSize({ width: 500, height: 1000 });
        await page.goto('/custom-breakpoints');

        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();
        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe('rgb(65, 117, 5)'); // greenish text color
      });
    });

    test.describe('when reset', () => {
      /*
        When no breakpoints are available, defaults are applied as
        breakpoints: {
          small: 640,
          medium: 991,
        }
      */
      test('large desktop size', async ({ page }) => {
        page.setViewportSize({ width: 992, height: 1000 });
        await page.goto('/custom-breakpoints-reset');

        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        let expectedTextColor = 'rgb(0, 0, 0)'; // black text color
        if (process.env.SDK === 'reactNative') {
          expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe(expectedTextColor); // black text color
      });

      test('medium tablet size', async ({ page }) => {
        page.setViewportSize({ width: 641, height: 1000 });

        await page.goto('/custom-breakpoints-reset');
        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        let expectedTextColor = 'rgb(208, 2, 27)'; // reddish text color
        if (process.env.SDK === 'reactNative') {
          expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe(expectedTextColor);
      });

      test('small mobile size', async ({ page }) => {
        page.setViewportSize({ width: 640, height: 1000 });
        await page.goto('/custom-breakpoints-reset');

        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe('rgb(65, 117, 5)'); // greenish text color
      });
    });
  });
});
