import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe('Duplicate Attributes', () => {
  test('wrapped block has no duplicate attributes', async ({ page, packageName, sdk }) => {
    test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    test.skip(packageName === 'react-native');
    await page.goto('/duplicate-attributes');

    const footer = await page.locator('footer');
    const section = await page.locator('section');

    const footerId = await footer?.getAttribute('builder-id', { timeout: 10000 });
    const footerClass = await footer?.getAttribute('class', { timeout: 10000 });

    const sectionId = await section?.getAttribute('builder-id', { timeout: 10000 });
    const sectionClass = await section?.getAttribute('class', { timeout: 10000 });

    expect(footerId).toBe('builder-6a8ccf9861154b7689ba9adfe4577a55');
    expect(sectionId).toBeNull();
    expect(footerClass?.includes('builder-6a8ccf9861154b7689ba9adfe4577a55')).toBe(true);
    expect(!!sectionClass?.includes('builder-6a8ccf9861154b7689ba9adfe4577a55')).toBe(false);
  });
});
