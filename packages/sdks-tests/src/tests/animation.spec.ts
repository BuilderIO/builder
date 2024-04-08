import { expect } from '@playwright/test';
import { excludeTestFor, isRNSDK, test } from './helpers/index.js';

test.describe('Animations', () => {
  test.fail(isRNSDK, 'TO-DO: React Native Animation API not implemented.');
  test.fail(excludeTestFor({ rsc: true }), 'Interactivity failure.');
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');

  test('renders animations', async ({ page }) => {
    await page.goto('/animations');

    const text = page.locator('[builder-id]').filter({ hasText: 'Enter some text...' });
    await expect(text).toHaveCSS('transition', 'all 30s cubic-bezier(0, 1.61, 0, 1.15) 0s');
    await expect(text).toHaveCSS('opacity', '1');

    const img = page.locator('[builder-id="builder-3cb8a3c70fea46ec99a57b336a66320c"]');
    await expect(img).toHaveCSS('transition', 'all 30s cubic-bezier(0, 1.61, 0, 1.15) 0s');
    await expect(img).toHaveCSS('opacity', '1');
  });
});
