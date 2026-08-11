import type { Page, Route } from '@playwright/test';

/**
 * Mock product data matching the fakestoreapi.com schema
 */
const MOCK_PRODUCTS: Record<string, any> = {
  '1': {
    id: 1,
    title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
    price: 109.95,
    description:
      'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    rating: {
      rate: 3.9,
      count: 120,
    },
  },
  '2': {
    id: 2,
    title: 'Mens Casual Premium Slim Fit T-Shirts',
    price: 22.3,
    description:
      'Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
    rating: {
      rate: 4.1,
      count: 259,
    },
  },
  '3': {
    id: 3,
    title: 'Mens Cotton Jacket',
    price: 55.99,
    description:
      'great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
    rating: {
      rate: 4.7,
      count: 500,
    },
  },
};

/**
 * Sets up Playwright route interception to mock fakestoreapi.com requests
 * @param page - Playwright Page object
 */
export async function mockFakeStoreAPI(page: Page) {
  // Mock product API requests
  await page.route('**/fakestoreapi.com/products/*', async (route: Route) => {
    const url = route.request().url();
    const productId = url.split('/products/')[1]?.split('?')[0];

    // Get mock product data or use product 1 as fallback
    const product = MOCK_PRODUCTS[productId] || MOCK_PRODUCTS['1'];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(product),
    });
  });

  // Mock image requests from fakestoreapi.com
  // This prevents tests from hanging when trying to load images from the blocked domain
  await page.route('**/fakestoreapi.com/img/**', async (route: Route) => {
    // Return a small transparent 1x1 PNG instead of trying to load from fakestoreapi.com
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: transparentPng,
    });
  });
}

/**
 * Sets up Playwright route interception to mock all fakestoreapi.com requests
 * This is a more comprehensive version that handles both product and products list endpoints
 * @param page - Playwright Page object
 */
export async function mockFakeStoreAPIAll(page: Page) {
  // Mock individual product requests
  await page.route('**/fakestoreapi.com/products/*', async (route: Route) => {
    const url = route.request().url();

    // Skip if this is the /products endpoint without an ID
    if (url.endsWith('/products') || url.endsWith('/products/')) {
      return route.continue();
    }

    const productId = url.split('/products/')[1]?.split('?')[0];
    const product = MOCK_PRODUCTS[productId] || MOCK_PRODUCTS['1'];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(product),
    });
  });

  // Mock products list endpoint
  await page.route('**/fakestoreapi.com/products', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(Object.values(MOCK_PRODUCTS)),
    });
  });

  // Mock image requests from fakestoreapi.com
  await page.route('**/fakestoreapi.com/img/**', async (route: Route) => {
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: transparentPng,
    });
  });
}
