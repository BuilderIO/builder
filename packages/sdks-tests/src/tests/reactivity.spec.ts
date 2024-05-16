import type { ConsoleMessage } from '@playwright/test';
import { expect } from '@playwright/test';
import { excludeTestFor, checkIsRN, test } from '../helpers/index.js';

test.describe('Reactive State', () => {
  test('shows default value', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    await page.goto('/reactive-state');

    await expect(page.getByText('0', { exact: true })).toBeVisible();
  });

  test('increments value correctly', async ({ page, packageName, sdk }) => {
    test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    test.fail(excludeTestFor({ rsc: true }, sdk));
    test.fail(packageName === 'next-app-dir');

    await page.goto('/reactive-state');

    await expect(page.getByText('0', { exact: true })).toBeVisible();

    await page.getByText('Increment Number').click();

    await expect(page.getByText('1', { exact: true })).toBeVisible();
  });

  test('updates deeply nested state value correctly', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    test.fail(excludeTestFor({ rsc: true }, sdk));
    test.skip(excludeTestFor({ vue: true }, sdk), 'TO-DO: Fix this test for Vue');
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=Content is expanded');
    await expect(menuLocator).toBeVisible();

    const btn = checkIsRN(sdk) ? page.locator('button') : page.getByRole('button');
    await expect(btn).toBeVisible();

    // hide
    await btn.click();
    await expect(menuLocator).toBeHidden();

    // show again
    await btn.click();
    await expect(menuLocator).toBeVisible();
  });
});

test.describe('Element Events', () => {
  const filterConsoleMessages = (consoleMessage: ConsoleMessage) => {
    const text = consoleMessage.text();
    return text.startsWith('clicked');
  };
  test('click works on button', async ({ page, sdk }) => {
    test.skip(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    await page.goto('/element-events');

    // Get the next console log message
    const msgPromise = page.waitForEvent('console', filterConsoleMessages);

    await page.getByText('Click me!').click();

    const msg = await msgPromise;

    expect(msg.text()).toEqual('clicked button');
  });
  test('click works on box', async ({ page, sdk }) => {
    test.skip(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    await page.goto('/element-events');

    // Get the next console log message
    const msgPromise = page.waitForEvent('console', filterConsoleMessages);

    await page.getByText('clickable BOX').click();
    const msg = await msgPromise;

    expect(msg.text()).toEqual('clicked box');
  });

  test('click works on text', async ({ page, sdk }) => {
    test.skip(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    await page.goto('/element-events');

    // Get the next console log message
    const msgPromise = page.waitForEvent('console', filterConsoleMessages);

    await page.getByText('clickable text').click();
    const msg = await msgPromise;

    expect(msg.text()).toEqual('clicked text');
  });
});
