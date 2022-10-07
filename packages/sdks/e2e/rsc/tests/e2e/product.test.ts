import {type Response as PlaywrightResponse} from 'playwright';
import {
  startHydrogenServer,
  type HydrogenServer,
  type HydrogenSession,
} from '../utils';
import Product from '../../src/routes/products/[handle].server';

describe('products', () => {
  let hydrogen: HydrogenServer;
  let session: HydrogenSession;
  let productUrl: string;

  beforeAll(async () => {
    hydrogen = await startHydrogenServer();
    hydrogen.watchForUpdates(Product);

    // Find a product url from home page
    session = await hydrogen.newPage();
    await session.visit('/');
    const link = await session.page.locator('a[href^="/products/"]').first();
    productUrl = await link.getAttribute('href');
  });

  beforeEach(async () => {
    session = await hydrogen.newPage();
  });

  afterAll(async () => {
    await hydrogen.cleanUp();
  });

  it('should have product title', async () => {
    await session.visit(productUrl);
    const heading = await session.page.locator('h1').first();
    expect(await heading.textContent()).not.toBeNull();
  });

  it('can be added to cart', async () => {
    // Make sure cart script loads
    await Promise.all([
      session.page.waitForResponse(
        'https://cdn.shopify.com/shopifycloud/shop-js/v1.0/client.js',
      ),
      session.visit(productUrl),
    ]);

    const addToCartButton = await session.page.locator('text=Add to bag');

    // Click on add to cart button
    const [cartResponse] = await Promise.all([
      session.page.waitForResponse((response: PlaywrightResponse) =>
        /graphql\.json/.test(response.url()),
      ),
      addToCartButton.click(),
    ]);

    const cartEvent = await cartResponse.json();
    expect(cartEvent.data).not.toBeNull();
  }, 60000);
});
