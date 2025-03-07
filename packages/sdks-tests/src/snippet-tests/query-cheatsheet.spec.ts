import { expect } from '@playwright/test';
import { findTextInPage, test } from '../helpers/index.js';

test.describe('Query Cheatsheet Examples', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(!['react', 'gen1-react'].includes(packageName));
    // Navigate to the product editorial page
    await page.goto('/query-cheatsheet');
  });

  test('loads query-cheatsheet', async ({ page }) => {
    await page.goto('/query-cheatsheet');
    await findTextInPage({ page, text: 'Query Cheatsheet' });
  });

  test('$eq', async ({ page }) => {
    const row = await page.locator('id=$eq');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$eq')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Red Jacket');
  });

  test('$gt', async ({ page }) => {
    const row = await page.locator('id=$gt');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$gt')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Yellow Jacket');
  });

  test('$gte', async ({ page }) => {
    const row = await page.locator('id=$gte');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$gte')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Yellow Jacket');
  });

  test('$in', async ({ page }) => {
    const row = await page.locator('id=$in');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$in')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Adalyn Herrera');
  });

  test('$lt', async ({ page }) => {
    const row = await page.locator('id=$lt');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$lt')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Red Jacket');
  });

  test('$lte', async ({ page }) => {
    const row = await page.locator('id=$lte');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$lte')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Black Jacket');
  });

  test('$ne', async ({ page }) => {
    const row = await page.locator('id=$ne');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$ne')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Adalyn Herrera');
  });

  test('$nin', async ({ page }) => {
    const row = await page.locator('id=$nin');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$nin')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Jennifer Moore');
  });

  test('$and', async ({ page }) => {
    const row = await page.locator('id=$and');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$and')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Yellow Jacket');
  });

  test('$not', async ({ page }) => {
    const row = await page.locator('id=$not');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$not')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Jennifer Moore');
  });

  test('$or', async ({ page }) => {
    const row = await page.locator('id=$or');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$or')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Jennifer Moore');
  });

  test('$nor', async ({ page }) => {
    const row = await page.locator('id=$nor');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$nor')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Yellow Jacket');
  });

  test('$exists', async ({ page }) => {
    const row = await page.locator('id=$exists');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$exists')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Adalyn Herrera');
  });

  test('$type', async ({ page }) => {
    const row = await page.locator('id=$type');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$type')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Adalyn Herrera');
  });

  test('$elemMatch', async ({ page }) => {
    const row = await page.locator('id=$elemMatch');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$elemMatch')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Adalyn Herrera');
  });

  test('$regex', async ({ page }) => {
    const row = await page.locator('id=$regex');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$regex')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Tyler Haney');
  });

  test('$options', async ({ page }) => {
    const row = await page.locator('id=$options');
    await expect(row).toBeVisible();
    await expect(row.locator('text=$options')).toBeVisible();

    const td = await row.locator('td').nth(2).textContent();
    await expect(td).toBe('Tyler Haney');
  });
});
