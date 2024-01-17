import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Duplicate Attributes', () => {
  test('wrapped block has no duplicate attributes', async ({ page, packageName }) => {
    test.skip(packageName === 'react-native');
    await page.goto('/duplicate-attributes');

    const footer = await page.locator('footer');
    const section = await page.locator('section');

    const footerId = await footer.getAttribute('builder-id');
    const footerClass = await footer.getAttribute('class');

    const sectionId = await section.getAttribute('builder-id');
    const sectionClass = await section.getAttribute('class');

    expect(footerId).toBe('builder-6a8ccf9861154b7689ba9adfe4577a55');
    expect(sectionId).toBeNull();
    expect(footerClass?.includes('builder-6a8ccf9861154b7689ba9adfe4577a55')).toBe(true);
    expect(!!sectionClass?.includes('builder-6a8ccf9861154b7689ba9adfe4577a55')).toBe(false);
  });
});
