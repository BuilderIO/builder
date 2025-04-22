import { expect } from '@playwright/test';
import { excludeGen1, excludeTestFor, test } from '../helpers/index.js';

test.describe('Form', () => {
  test('Form rendering correctly', async ({ page, sdk }) => {
    test.skip(
      excludeTestFor({ reactNative: true, rsc: true }, sdk),
      'Form not implemented in React Native and NextJS SDKs.'
    );
    await page.goto('/form');

    const form = page.locator('form');
    await expect(form).toHaveCount(1);

    await expect(page.locator('input')).toHaveCount(2);
    await expect(form.locator('input')).toHaveCount(2);

    await expect(page.locator('button')).toHaveCount(1);
    await expect(form.locator('button')).toHaveCount(1);

    await expect(page.locator('select')).toHaveCount(1);
    await expect(form.locator('select')).toHaveCount(1);
    await expect(form.locator('select').first().locator('option')).toHaveCount(3);

    await expect(page.locator('textarea')).toHaveCount(1);
    await expect(form.locator('textarea')).toHaveCount(1);

    expect(await form.locator('button').first().innerText()).toBe('Submit');
  });

  test('check all fields are html required', async ({ page, sdk }) => {
    test.skip(
      excludeTestFor({ reactNative: true, rsc: true }, sdk),
      'Form not implemented in React Native and NextJS SDKs.'
    );

    await page.goto('/form');

    const form = page.locator('form');
    await expect(form).toHaveCount(1);

    const inputs = await form.locator('input').all();
    for (const input of inputs) {
      await expect(input).toHaveAttribute('required');
    }
    await expect(form.locator('select')).toHaveAttribute('required');
    await expect(form.locator('textarea')).toHaveAttribute('required');
  });

  test('form submission', async ({ page, sdk }) => {
    test.skip(
      excludeTestFor({ reactNative: true, rsc: true }, sdk),
      'Form not implemented in React Native and NextJS SDKs.'
    );

    test.skip(excludeGen1(sdk));

    await page.goto('/form');

    const form = page.locator('form');
    await expect(form).toHaveCount(1);

    const inputs = await form.locator('input').all();
    await inputs[0].fill('Test Name');
    await inputs[1].fill('test@example.com');
    await page.locator('select').selectOption('20-30');
    await page.locator('textarea').fill('Test message');

    // Create console listener before clicking submit
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Submit the form
    await form.locator('button').click();

    // Verify error message was logged
    if (sdk === 'solid') {
      await expect(page.locator('.builder-text').nth(3)).toHaveText(
        'SubmissionsToEmail is required when sendSubmissionsTo is set to email'
      );
    } else {
      expect(consoleMessages).toContain(
        'SubmissionsToEmail is required when sendSubmissionsTo is set to email'
      );
    }
  });
});
