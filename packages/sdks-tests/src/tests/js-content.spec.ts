import { test } from './helpers.js';

test.describe('JS Content', () => {
  test('Code inside Browser.isBrowser should work', async ({ page }) => {
    await page.goto('/js-content');
    await page.waitForSelector('text=2024'); // we are getting state.year from the code
  });
});
