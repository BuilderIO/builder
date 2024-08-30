import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe.only('Large Reactive State', () => {
  test('shows default value', async ({ page }) => {
    await page.goto('/large-reactive-state');

    await expect(page.getByText('0', { exact: true })).toBeVisible();
  });

  test('increments value correctly', async ({ page, packageName, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));
    test.fail(packageName === 'nextjs-sdk-next-app');

    await page.goto('/large-reactive-state');

    await expect(page.getByText('0', { exact: true })).toBeVisible();

    await page.getByText('Increment Number').click();

    await expect(page.getByText('1', { exact: true })).toBeVisible();
  });

  test('renders all dummy text blocks with correct bindings', async ({ page }) => {
    await page.goto('/large-reactive-state');

    // Check if the last dummy text block is rendered
    await expect(page.getByText('Dummy text block 1000')).toBeVisible();
  });

  test('maintains reactivity with large state', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));

    await page.goto('/large-reactive-state');

    // Initial state
    await expect(page.getByText('0', { exact: true })).toBeVisible();

    // Increment multiple times
    for (let i = 1; i <= 5; i++) {
      await page.getByText('Increment Number').click();
      await expect(page.getByText(`${i}`, { exact: true })).toBeVisible();
    }
  });

  test('performance check for large state updates', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));

    await page.goto('/large-reactive-state');

    const startTime = Date.now();

    // Perform multiple state updates
    for (let i = 0; i < 10; i++) {
      await page.getByText('Increment Number').click();
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assuming a threshold of 1000ms for 10 updates
    expect(duration).toBeLessThan(2000);

    // Verify final state
    await expect(page.getByText('10', { exact: true })).toBeVisible();
  });
});
