import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Hero Section', () => {
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
        'angular-19-ssr',
        'gen1-react',
        'gen1-remix',
        'gen1-next14-pages',
        'gen1-next15-app',
      ].includes(packageName)
    );
    await page.goto('/marketing-event');
  });

  test('should display the hero section with title and call-to-action', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const heading = page.getByText('Find the best shoes in town');
    await expect(heading).toBeVisible();

    const ctaButton = page.getByRole('button', { name: 'Buy now' });
    await expect(ctaButton).toBeVisible();
  });

  test('should display hero image', async ({ page }) => {
    const imgInPicture = page.locator('picture img');
    await expect(imgInPicture).toBeVisible();
    await expect(imgInPicture).toHaveAttribute('src', /.+/);
  });
});