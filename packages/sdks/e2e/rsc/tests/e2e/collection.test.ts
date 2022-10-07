import {
  startHydrogenServer,
  type HydrogenServer,
  type HydrogenSession,
} from '../utils';
import Collections from '../../src/routes/collections/[handle].server';

describe('collections', () => {
  let hydrogen: HydrogenServer;
  let session: HydrogenSession;
  let collectionUrl: string;

  beforeAll(async () => {
    hydrogen = await startHydrogenServer();
    hydrogen.watchForUpdates(Collections);

    // Find a collection url from home page
    session = await hydrogen.newPage();
    await session.visit('/');
    const link = await session.page.locator('a[href^="/collections/"]').first();
    collectionUrl = await link.getAttribute('href');
  });

  beforeEach(async () => {
    session = await hydrogen.newPage();
  });

  afterAll(async () => {
    await hydrogen.cleanUp();
  });

  it('should have collection title', async () => {
    await session.visit(collectionUrl);

    const heading = await session.page.locator('h1').first();
    expect(await heading.textContent()).not.toBeNull();
  });

  it('should have collection product tiles', async () => {
    await session.visit(collectionUrl);

    const products = await session.page.locator('#mainContent section a');
    expect(await products.count()).not.toEqual(0);
  });
});
