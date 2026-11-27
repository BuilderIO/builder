// Measures Builder content hydration cost for the Angular 19 SSR app.
// Usage: BASE_URL=http://localhost:4000 RUNS=10 node scripts/measure-hydration.mjs [/path] > scripts/baseline.json
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const PATH = process.argv[2] || '/';
const RUNS = Number(process.env.RUNS || 10);
const CPU_THROTTLE = Number(process.env.CPU_THROTTLE || 4);
const HOST = 'content-component';

// Runs before any page script. Records content-root churn, LCP and long tasks.
const initScript = () => {
  const HOST = 'content-component';
  const m = (window.__m = {
    armed: true,
    removed: 0,
    added: 0,
    reAdded: 0,
    removedSet: new WeakSet(),
    lcp: 0,
    longTasks: [],
    fcp: 0,
  });
  const inRoot = (node) => {
    const el = node && node.nodeType === 1 ? node : node && node.parentElement;
    return !!(el && el.closest && el.closest(HOST));
  };
  new MutationObserver((records) => {
    if (!m.armed) return;
    for (const r of records) {
      if (!inRoot(r.target)) continue;
      for (const n of r.removedNodes) {
        m.removed++;
        m.removedSet.add(n);
      }
      for (const n of r.addedNodes) {
        m.added++;
        if (m.removedSet.has(n)) m.reAdded++;
      }
    }
  }).observe(document, { childList: true, subtree: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) m.lcp = e.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.name === 'first-contentful-paint') m.fcp = e.startTime;
    }
  }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) m.longTasks.push({ start: e.startTime, dur: e.duration });
  }).observe({ type: 'longtask', buffered: true });
};

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

// SSR HTML: does the builder-content host carry ngskiphydration?
const checkSsrHtml = async (url) => {
  const html = await (await fetch(url)).text();
  const hostTag = html.match(new RegExp(`<${HOST}\\b[^>]*>`, 'i'))?.[0] || null;
  return {
    htmlBytes: html.length,
    hostTagFound: !!hostTag,
    containsNgSkipHydrationOnHost: !!hostTag && /\bngskiphydration\b/i.test(hostTag),
    hostTag,
  };
};

const runOnce = async (browser, url) => {
  const ssr = await checkSsrHtml(url);
  const context = await browser.newContext();
  await context.addInitScript(initScript);
  const page = await context.newPage();
  const consoleNg = [];
  page.on('console', (msg) => {
    if (/NG05\d\d/.test(msg.text())) consoleNg.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (err) => {
    if (/NG05\d\d/.test(err.message)) consoleNg.push(`pageerror: ${err.message.slice(0, 300)}`);
  });

  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE });

  await page.goto(url, { waitUntil: 'load' });
  // Wait for the Builder host to exist (client bootstrap has run), then let hydration settle.
  await page.waitForSelector(HOST, { timeout: 15000 });
  await page.evaluate(() => window.__m.armed = true);
  await page.waitForTimeout(2000);

  const result = await page.evaluate((HOST) => {
    const m = window.__m;
    const host = document.querySelector(HOST);
    const fcpLcp = { fcp: m.fcp, lcp: m.lcp };
    const tbt = m.longTasks
      .filter((t) => t.start >= m.fcp)
      .reduce((sum, t) => sum + Math.max(0, t.dur - 50), 0);
    return {
      hostHasNgh: !!host && host.hasAttribute('ngh'),
      hostHasNgSkipHydration: !!host && host.hasAttribute('ngskiphydration'),
      contentRootChildren: host ? host.querySelectorAll('*').length : 0,
      domRemoved: m.removed,
      domAdded: m.added,
      domReAdded: m.reAdded,
      fcpMs: Math.round(fcpLcp.fcp),
      lcpMs: Math.round(fcpLcp.lcp),
      tbtMs: Math.round(tbt),
      longTaskCount: m.longTasks.length,
    };
  }, HOST);

  await context.close();
  return { ssrHtml: ssr, ...result, ngConsoleMessages: consoleNg };
};

const main = async () => {
  const url = new URL(PATH, BASE_URL).toString();
  const browser = await chromium.launch();
  const runs = [];
  try {
    for (let i = 0; i < RUNS; i++) runs.push(await runOnce(browser, url));
  } finally {
    await browser.close();
  }

  const nums = ['domRemoved', 'domAdded', 'domReAdded', 'fcpMs', 'lcpMs', 'tbtMs', 'contentRootChildren', 'longTaskCount'];
  const medians = Object.fromEntries(nums.map((k) => [k, median(runs.map((r) => r[k]))]));
  const count = (k) => runs.filter((r) => r[k]).length;

  const out = {
    url,
    path: PATH,
    runs: RUNS,
    cpuThrottleRate: CPU_THROTTLE,
    generatedAt: new Date().toISOString(),
    summary: {
      ssrNgSkipHydrationOnHost: `${runs.filter((r) => r.ssrHtml.containsNgSkipHydrationOnHost).length}/${RUNS}`,
      ssrHostTagFound: `${runs.filter((r) => r.ssrHtml.hostTagFound).length}/${RUNS}`,
      hostHasNgh: `${count('hostHasNgh')}/${RUNS}`,
      hostHasNgSkipHydration: `${count('hostHasNgSkipHydration')}/${RUNS}`,
      ngConsoleMessagesTotal: runs.reduce((n, r) => n + r.ngConsoleMessages.length, 0),
      median: medians,
    },
    runs,
  };
  console.log(JSON.stringify(out, null, 2));
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
