import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

const CUSTOM_ACTION_LOADED_MESSAGE = "function call";

test.describe('Custom Actions', () => {
  test('should verify button click with custom action', async ({ page, packageName }) => {
    test.skip(packageName !== 'gen1-react');

    await page.goto('/custom-action');

    const button = page.locator('text=Click me!');
    await expect(button).toBeVisible();

    const customActionMsgPromise = page.waitForEvent('console', msg =>
        msg.text().includes(CUSTOM_ACTION_LOADED_MESSAGE)
    );

    await button.click();
    await customActionMsgPromise;
  });
});
