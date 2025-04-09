import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Nav Bar Components', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(!['angular-16', 'angular-16-ssr', 'vue'].includes(packageName));
    // Visit the page where NavBarComponent is rendered
    await page.goto('/landing-page');
  });

  test.describe('NavBarComponent', () => {
    test('should display brand name', async ({ page }) => {
      const brandNameLocator = page.locator('h1');
      await brandNameLocator.waitFor();

      const brandName = await brandNameLocator.textContent();
      expect(brandName).toBe('Acme company');
    });

    test('should display login and register buttons', async ({ page }) => {
      const loginButton = page.locator('button:text("Login")');
      const registerButton = page.locator('button:text("Register")');

      await expect(loginButton).toBeVisible();
      await expect(registerButton).toBeVisible();
    });

    test('should contain NavLinksComponent', async ({ page }) => {
      const navLinksComponent = page.locator('app-nav-links');
      await expect(navLinksComponent).toBeVisible();
    });
  });

  test.describe('NavLinksComponent', () => {
    test('should display navigation links', async ({ page }) => {
      // Wait for the links to be loaded
      await page.waitForSelector('app-nav-links ul li');

      const links = page.locator('app-nav-links ul li a');
      const linksCount = await links.count();

      // Ensure there are links (adjust the number if you know the exact count)
      expect(linksCount).toBeGreaterThan(0);

      // Check each link
      for (let i = 0; i < linksCount; i++) {
        const link = links.nth(i);
        await expect(link).toHaveAttribute('href');
        await expect(link).toHaveCSS('text-decoration', 'none solid rgb(0, 0, 238)');

        // Verify link text is not empty
        const linkText = await link.textContent();
        expect(linkText?.trim().length).toBeGreaterThan(0);
      }
    });
  });
});
