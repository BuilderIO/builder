import { expect } from '@playwright/test';
import { findTextInPage, test } from '../helpers/index.js';

test.describe('API Endpoint', () => {
  test.describe('Live', () => {
    test('loads symbol', async ({ page }) => {
      await page.goto('/contentwithsymbol');

      await findTextInPage({ page, text: 'This is my Symbol!' });
    });

    test('records API calls after page load', async ({ page, packageName }) => {
      test.skip(packageName !== 'gen1-next');
      // Start monitoring network requests
      const urlMatchForContentAPI = /https:\/\/cdn\.builder\.io\/api\/v3\/content/;
      const urlMatchForQueryAPI = /https:\/\/cdn\.builder\.io\/api\/v3\/query/;

      let queryApiInvocations = 0;

      const responsePromise = page.waitForResponse(urlMatchForContentAPI);

      await page.route(urlMatchForQueryAPI, route => {
        queryApiInvocations++;
        return route.continue();
      });

      await page.goto(
        '/contentwithsymbol?builder.space=ee9f13b4981e489a9a1209887695ef2b&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditDesigns%2CeditLayouts%2CeditLayers%2CeditContentPriority&builder.user.role.name=Designer&builder.user.role.id=creator&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=6a2f7e1a9ab2454ba6766522d6d99f0d&builder.overrides.6a2f7e1a9ab2454ba6766522d6d99f0d=6a2f7e1a9ab2454ba6766522d6d99f0d&builder.overrides.page:/contentwithsymbol=6a2f7e1a9ab2454ba6766522d6d99f0d&builder.frameEditing=page&builder.options.locale=Default',
        { waitUntil: 'networkidle' }
      );

      // Verify API calls were recorded
      const req = (await responsePromise).request();
      expect(req).toBeDefined();
      expect(req!.method()).toBe('GET');
      expect(queryApiInvocations).toBe(0);
    });
  });
});
