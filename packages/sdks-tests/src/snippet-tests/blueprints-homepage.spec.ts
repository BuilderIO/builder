import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'remix',
        'react-sdk-next-15-app',
        'nextjs-sdk-next-app',
        'react',
        'angular-19-ssr',
        'gen1-react',
        'gen1-remix',
        'gen1-next14-pages',
        'gen1-next15-app',
      ].includes(packageName)
    );
    await page.goto('/home');
  });

  test('should display the Builder.io logo header', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Builder.io')).toBeVisible();
  });

  test('should display the main heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: 'Visual Development Platform',
        level: 1,
      })
    ).toBeVisible();
  });

  test('should display the community section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Our Community', level: 2 })).toBeVisible();
  });

  test('should display navigation buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });
});
