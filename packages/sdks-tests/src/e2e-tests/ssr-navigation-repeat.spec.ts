import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('SSR with Navigation and Repeat Collection', () => {
  test.only('should render homepage with SSR and navigate to page with repeat collection', async ({
    page,
  }) => {
    // Step 1: Verify SSR rendering on homepage
    await page.goto('/');

    // Wait for homepage content to be visible
    // The homepage should render without requiring JavaScript
    const homeContent = page.locator('text=Data Bindings');
    await expect(homeContent).toBeVisible();

    // Step 2: Client-side navigate to page with repeat collection
    // Click the link on the homepage to trigger client-side navigation
    const collegeResultsLink = page.locator('text=College Results Repeat');
    await collegeResultsLink.click();

    // Step 3: Verify the header is rendered
    const header = page.locator('h1:has-text("Top Colleges")');
    await expect(header).toBeVisible();

    // Step 4: Verify all repeated items are rendered correctly
    // Check that all 5 colleges are displayed with correct data
    await expect(page.locator('text=Rank #1: Stanford University')).toBeVisible();
    await expect(page.locator('text=Location: California')).toBeVisible();

    await expect(page.locator('text=Rank #2: MIT')).toBeVisible();
    await expect(page.locator('text=Location: Massachusetts').first()).toBeVisible();

    await expect(page.locator('text=Rank #3: Harvard University')).toBeVisible();
    // Massachusetts location should appear twice (for MIT and Harvard)

    await expect(page.locator('text=Rank #4: Princeton University')).toBeVisible();
    await expect(page.locator('text=Location: New Jersey')).toBeVisible();

    await expect(page.locator('text=Rank #5: Yale University')).toBeVisible();
    await expect(page.locator('text=Location: Connecticut')).toBeVisible();

    // Step 5: Verify the correct number of college cards are rendered
    // Each college should have its own card with the bindings resolved
    const collegeCards = page.locator('[builder-id="builder-college-card"]');
    await expect(collegeCards).toHaveCount(5);
  });

  test('should render repeat collection with correct state bindings', async ({ page }) => {
    await page.goto('/college-results-repeat');

    // Wait for content to load
    const header = page.locator('h1:has-text("Top Colleges")');
    await expect(header).toBeVisible();

    // Verify that state.college.results bindings work correctly
    // Check that the repeat rendered 5 items
    const allCollegeNames = [
      'Rank #1: Stanford University',
      'Rank #2: MIT',
      'Rank #3: Harvard University',
      'Rank #4: Princeton University',
      'Rank #5: Yale University',
    ];

    // Verify each college name is visible
    for (const collegeName of allCollegeNames) {
      await expect(page.locator(`text=${collegeName}`)).toBeVisible();
    }

    // Verify locations are bound correctly
    const allLocations = [
      'Location: California',
      'Location: Massachusetts',
      'Location: New Jersey',
      'Location: Connecticut',
    ];

    for (const location of allLocations) {
      await expect(page.locator(`text=${location}`).first()).toBeVisible();
    }
  });

  test('should maintain repeat collection state during hydration', async ({ page }) => {
    await page.goto('/college-results-repeat');

    // Wait for the page to be fully hydrated
    await page.waitForLoadState('networkidle');

    // After hydration, the repeat collection should still be rendered correctly
    await expect(page.locator('text=Rank #1: Stanford University')).toBeVisible();
    await expect(page.locator('text=Rank #5: Yale University')).toBeVisible();

    // Verify that all 5 colleges are still present after hydration
    const collegeCards = page.locator('[builder-id="builder-college-card"]');
    await expect(collegeCards).toHaveCount(5);
  });

  test('should render repeat collection with SSR (JavaScript disabled)', async ({ browser }) => {
    // Create a new context with JavaScript disabled
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    // Navigate to the college results page
    await page.goto('/college-results-repeat');

    // Verify that the content is rendered via SSR (without JavaScript)
    const header = page.locator('h1:has-text("Top Colleges")');
    await expect(header).toBeVisible();

    // Verify that all colleges are rendered server-side
    await expect(page.locator('text=Rank #1: Stanford University')).toBeVisible();
    await expect(page.locator('text=Rank #2: MIT')).toBeVisible();
    await expect(page.locator('text=Rank #3: Harvard University')).toBeVisible();
    await expect(page.locator('text=Rank #4: Princeton University')).toBeVisible();
    await expect(page.locator('text=Rank #5: Yale University')).toBeVisible();

    // Verify locations are also rendered
    await expect(page.locator('text=Location: California')).toBeVisible();
    await expect(page.locator('text=Location: Massachusetts').first()).toBeVisible();

    await context.close();
  });
});
