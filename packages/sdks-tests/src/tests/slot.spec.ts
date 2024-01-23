import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Slot', () => {
  test('slot should render', async ({ page, packageName }) => {
    // gen1-remix and gen1-next skipped because React.useContext is not recognized
    // rsc skipped because it fetches the slot content from the server
    test.fail(['gen1-remix', 'gen1-next', 'next-app-dir'].includes(packageName));
    await page.goto('/slot');
    await expect(page.locator('text=Inside a slot!!')).toBeVisible();
  });

  test('slot should render in the correct place', async ({ page, packageName }) => {
    // gen1-remix and gen1-next skipped because React.useContext is not recognized
    // rsc skipped because it fetches the slot content from the server
    test.fail(['gen1-remix', 'gen1-next', 'next-app-dir', 'react-native'].includes(packageName));
    await page.goto('/slot');
    const builderTextElements = page.locator('.builder-text');
    const count = await builderTextElements.count();
    expect(count).toBe(3);
    const slotElement = builderTextElements.nth(1);
    await expect(slotElement).toHaveText('Inside a slot!!');
  });
});
