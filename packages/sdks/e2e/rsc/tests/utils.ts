import {
  chromium,
  type Page,
  type Response as PlaywrightResponse,
} from 'playwright';
import '@shopify/hydrogen/web-polyfills';
import type {Server} from 'http';

// `version` is only exported in Vite 3
import * as vite from 'vite';
const {createServer: createViteDevServer, version} = vite;

export interface HydrogenSession {
  page: Page;
  visit: (pathname: string) => Promise<PlaywrightResponse | null>;
}

export interface HydrogenServer {
  url: (pathname: string) => string;
  newPage: () => Promise<HydrogenSession>;
  cleanUp: () => Promise<void>;
  watchForUpdates: (_module: any) => void;
}

export async function startHydrogenServer(): Promise<HydrogenServer> {
  const app = import.meta.env.WATCH
    ? await createDevServer()
    : await createNodeServer();

  const browser = await chromium.launch();
  const url = (pathname: string) => `http://localhost:${app.port}${pathname}`;

  const newPage = async () => {
    const page = await browser.newPage();
    return {
      page,
      visit: async (pathname: string) => page.goto(url(pathname)),
    };
  };

  const cleanUp = async () => {
    await browser.close();
    await app.server?.close();
  };

  return {url, newPage, cleanUp, watchForUpdates: () => {}};
}

async function createNodeServer() {
  // @ts-ignore
  const {createServer} = await import('../dist/node');
  const app = (await createServer()).app;
  const server = app.listen(0) as Server;
  const port: number = await new Promise((resolve) => {
    server.on('listening', () => {
      resolve(getPortFromAddress(server.address()));
    });
  });

  return {server, port};
}

async function createDevServer() {
  const isVite3 = version?.startsWith('3.');
  const app = await createViteDevServer({
    [isVite3 ? 'optimizeDeps' : 'server']: {force: true},
    logLevel: 'silent',
  });
  const server = await app.listen(0);

  return {
    server: server.httpServer,
    port: getPortFromAddress(server.httpServer!.address()),
  };
}

function getPortFromAddress(address: string | any): number {
  if (typeof address === 'string') {
    return parseInt(address.split(':').pop()!);
  } else {
    return address.port;
  }
}
