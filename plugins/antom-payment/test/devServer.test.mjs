import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { startDevServer } = require('../scripts/dev-server.cjs');
const logger = { log() {}, info() {}, warn() {}, error() {} };
const notice = 'Synthetic development dependency notice.\n';
const privateContent = 'SYNTHETIC_PRIVATE_FIXTURE_DO_NOT_SERVE';
const testOptions = { timeout: 30000 };

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

async function bounded(promise, message, milliseconds = 8000) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function eventually(check, message) {
  const deadline = Date.now() + 8000;
  do {
    const result = await check();
    if (result) return result;
    await delay(25);
  } while (Date.now() < deadline);
  assert.fail(message);
}

function request(url, requestPath = '/plugin.system.js', { method = 'GET', host } = {}) {
  const target = new URL(url);
  return new Promise((resolve, reject) => {
    const connection = http.request({
      hostname: '127.0.0.1',
      port: Number(target.port),
      path: requestPath,
      method,
      headers: { Host: host ?? target.host, Connection: 'close' },
      setHost: false,
      agent: false,
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks).toString('utf8'),
      }));
    });
    connection.setTimeout(2000, () => connection.destroy(new Error('HTTP fixture request timed out')));
    connection.on('error', reject);
    connection.end();
  });
}

function assertBrowserHeaders(response) {
  assert.equal(response.headers['access-control-allow-origin'], '*');
  assert.equal(response.headers['access-control-allow-private-network'], 'true');
  assert.match(response.headers['cache-control'] ?? '', /\bno-store\b/);
}

function buildControl() {
  const pending = [];
  const gates = [];
  const state = { outputPaths: [], completed: [], shutdowns: 0 };
  return {
    state,
    holdNext() {
      const entered = deferred();
      const released = deferred();
      const gate = {
        entered: () => bounded(entered.promise, 'Webpack did not start the expected compilation'),
        release: () => released.resolve(),
        signal: entered.resolve,
        wait: released.promise,
      };
      pending.push(gate);
      gates.push(gate);
      return gate;
    },
    releaseAll() { for (const gate of gates) gate.release(); },
    plugin: {
      apply(compiler) {
        state.outputPaths.push(compiler.options.output.path);
        compiler.hooks.beforeCompile.tapPromise('DevServerFixture', async () => {
          const gate = pending.shift();
          if (gate) {
            gate.signal();
            await gate.wait;
          }
        });
        compiler.hooks.thisCompilation.tap('DevServerFixture', compilation => {
          compilation.hooks.processAssets.tap({
            name: 'DevServerFixture',
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
          }, () => {
            compilation.emitAsset('plugin.system.js.LICENSE.txt', new compiler.webpack.sources.RawSource(notice));
            compilation.emitAsset('.env', new compiler.webpack.sources.RawSource(privateContent));
            compilation.emitAsset('private.txt', new compiler.webpack.sources.RawSource(privateContent));
          });
        });
        compiler.hooks.done.tap('DevServerFixture', stats => {
          state.completed.push({ errors: stats.hasErrors() });
        });
        compiler.hooks.shutdown.tap('DevServerFixture', () => { state.shutdowns += 1; });
      },
    },
  };
}

async function withFixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'antom-dev-server-test-'));
  const production = path.join(root, 'production');
  const entry = path.join(root, 'entry.js');
  const control = buildControl();
  const servers = new Set();
  const originalFiles = {
    'plugin.system.js': 'Existing production bundle.\n',
    'plugin.system.js.LICENSE.txt': 'Existing production license.\n',
    'keep.txt': 'Existing production file.\n',
  };
  try {
    await mkdir(production);
    await writeFile(entry, 'export const fixture = "INITIAL_FIXTURE_VALUE";\n');
    await writeFile(path.join(root, '.env'), privateContent);
    for (const [name, content] of Object.entries(originalFiles)) {
      await writeFile(path.join(production, name), content);
    }
    const config = {
      mode: 'development',
      context: root,
      entry,
      devtool: false,
      output: { path: production, filename: 'plugin.system.js', libraryTarget: 'system', clean: true },
      plugins: [control.plugin],
      watchOptions: { aggregateTimeout: 10, poll: 50 },
    };
    const fixture = {
      config, control, entry, production,
      async start(port = 0) {
        const starting = startDevServer({ config, port, logger });
        // Register immediately on resolution so cleanup also sees a late startup.
        starting.then(server => servers.add(server), () => {});
        return bounded(starting, 'Development server startup timed out');
      },
      async close(server) {
        await bounded(server.close(), 'Development server close timed out');
        servers.delete(server);
      },
      async assertProductionPreserved() {
        assert.equal(config.output.path, production, 'The caller configuration must not be mutated');
        assert.deepEqual((await readdir(production)).sort(), Object.keys(originalFiles).sort());
        for (const [name, content] of Object.entries(originalFiles)) {
          assert.equal(await readFile(path.join(production, name), 'utf8'), content);
        }
      },
    };
    await run(fixture);
  } finally {
    control.releaseAll();
    try {
      for (const server of servers) {
        await bounded(server.close(), 'Development server cleanup timed out');
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
}

async function readyBundle(server, marker) {
  return eventually(async () => {
    const response = await request(server.url);
    return response.status === 200 && response.body.includes(marker) ? response : false;
  }, `Development bundle did not contain ${marker}`);
}

async function listen(server, port = 0) {
  await bounded(new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  }), 'Fixture listener did not start');
  return server.address().port;
}

async function closeListener(server) {
  if (!server.listening) return;
  await bounded(new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  }), 'Fixture listener did not close');
}

test('development server serves only built plugin assets with browser headers', testOptions, async () => {
  await withFixture(async fixture => {
    const firstBuild = fixture.control.holdNext();
    const server = await fixture.start();
    await firstBuild.entered();
    assert.equal(server.server.address().address, '127.0.0.1');
    assert.equal(Number(new URL(server.url).port), server.server.address().port);
    const building = await request(server.url);
    assert.equal(building.status, 503);
    assert.doesNotMatch(building.body, /INITIAL_FIXTURE_VALUE|Existing production bundle/);
    assertBrowserHeaders(building);

    firstBuild.release();
    const bundle = await readyBundle(server, 'INITIAL_FIXTURE_VALUE');
    assert.match(bundle.body, /System\.register/);
    assert.match(bundle.headers['content-type'] ?? '', /javascript/);
    assertBrowserHeaders(bundle);

    const pluginId = await request(server.url, '/plugin.system.js?pluginId=%40fixture%2Fplugin');
    assert.equal(pluginId.status, 200);
    assert.equal(pluginId.body, bundle.body);
    const localHost = await request(server.url, '/plugin.system.js', {
      host: `localhost:${server.server.address().port}`,
    });
    assert.equal(localHost.status, 200);

    const head = await request(server.url, '/plugin.system.js', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(head.body, '');
    assert.equal(Number(head.headers['content-length']), Buffer.byteLength(bundle.body));
    assertBrowserHeaders(head);

    const license = await request(server.url, '/plugin.system.js.LICENSE.txt');
    assert.equal(license.status, 200);
    assert.equal(license.body, notice);
    assertBrowserHeaders(license);
    for (const asset of ['/plugin.system.js', '/plugin.system.js.LICENSE.txt']) {
      const options = await request(server.url, asset, { method: 'OPTIONS' });
      assert.equal(options.status, 204);
      assert.equal(options.body, '');
      assertBrowserHeaders(options);
    }
    assert.equal(fixture.control.state.outputPaths.length, 1);
    assert.notEqual(fixture.control.state.outputPaths[0], fixture.production);
    await fixture.assertProductionPreserved();
  });
});

test('development server rejects foreign hosts, non-asset paths and write methods', testOptions, async () => {
  await withFixture(async fixture => {
    const server = await fixture.start();
    await readyBundle(server, 'INITIAL_FIXTURE_VALUE');
    const port = server.server.address().port;
    for (const host of [
      `foreign.invalid:${port}`, `localhost.foreign.invalid:${port}`,
      `127.0.0.1.foreign.invalid:${port}`, `localhost:${port === 65535 ? 65534 : port + 1}`,
      'localhost', '127.0.0.1', '',
    ]) {
      const response = await request(server.url, '/plugin.system.js', { host });
      assert.equal(response.status, 403, `Unexpected status for Host ${host}`);
      assert.doesNotMatch(response.body, /INITIAL_FIXTURE_VALUE/);
    }
    for (const requestPath of [
      '/', '/.env', '/private.txt', '/entry.js', '/src/private.js', '/node_modules/private.js',
      '/../.env', '/%2e%2e/.env', '/plugin.system.js/../.env',
      '/%2e%2e/plugin.system.js', '/plugin.system.js%00', '/plugin.system.js.map', '/plugin.system.js/',
    ]) {
      const response = await request(server.url, requestPath);
      assert.equal(response.status, 404, `Unexpected status for path ${requestPath}`);
      assert.ok(!response.body.includes(privateContent));
      assert.doesNotMatch(response.body, /INITIAL_FIXTURE_VALUE/);
    }
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const response = await request(server.url, '/plugin.system.js', { method });
      assert.equal(response.status, 405, `Unexpected status for ${method}`);
      assert.doesNotMatch(response.body, /INITIAL_FIXTURE_VALUE/);
    }
    assert.equal((await request(server.url, '/.env', { method: 'OPTIONS' })).status, 404);
    assert.equal((await request(server.url, '/plugin.system.js', {
      method: 'OPTIONS', host: `foreign.invalid:${port}`,
    })).status, 403);
  });
});

test('watch rebuilds suppress stale bundles during compilation and recover after errors', testOptions, async () => {
  await withFixture(async fixture => {
    const server = await fixture.start();
    await readyBundle(server, 'INITIAL_FIXTURE_VALUE');

    const rebuilding = fixture.control.holdNext();
    await writeFile(fixture.entry, 'export const fixture = "UPDATED_FIXTURE_VALUE";\n');
    await rebuilding.entered();
    const pending = await request(server.url);
    assert.equal(pending.status, 503);
    assert.doesNotMatch(pending.body, /INITIAL_FIXTURE_VALUE|UPDATED_FIXTURE_VALUE/);
    assert.equal((await request(server.url, '/plugin.system.js.LICENSE.txt')).status, 503);
    rebuilding.release();
    const updated = await readyBundle(server, 'UPDATED_FIXTURE_VALUE');
    assert.doesNotMatch(updated.body, /INITIAL_FIXTURE_VALUE/);

    const failing = fixture.control.holdNext();
    await writeFile(fixture.entry, 'export const = ;\n');
    await failing.entered();
    assert.equal((await request(server.url)).status, 503);
    failing.release();
    await eventually(() => fixture.control.state.completed.some(build => build.errors),
      'Webpack did not report the expected syntax error');
    const failed = await request(server.url);
    assert.equal(failed.status, 503);
    assert.doesNotMatch(failed.body, /INITIAL_FIXTURE_VALUE|UPDATED_FIXTURE_VALUE/);
    assertBrowserHeaders(failed);

    await writeFile(fixture.entry, 'export const fixture = "RECOVERED_FIXTURE_VALUE";\n');
    const recovered = await readyBundle(server, 'RECOVERED_FIXTURE_VALUE');
    assert.doesNotMatch(recovered.body, /UPDATED_FIXTURE_VALUE/);
    await fixture.assertProductionPreserved();
  });
});

test('closing releases the port, removes temporary output and preserves production files', testOptions, async () => {
  await withFixture(async fixture => {
    const server = await fixture.start();
    await readyBundle(server, 'INITIAL_FIXTURE_VALUE');
    const port = server.server.address().port;
    const temporaryOutput = fixture.control.state.outputPaths[0];
    assert.ok((await stat(temporaryOutput)).isDirectory());
    await fixture.close(server);
    await bounded(server.close(), 'Repeated close did not finish');
    assert.equal(server.server.listening, false);
    assert.equal(fixture.control.state.shutdowns, 1);
    await assert.rejects(stat(temporaryOutput), { code: 'ENOENT' });
    await fixture.assertProductionPreserved();

    const replacement = http.createServer();
    try {
      assert.equal(await listen(replacement, port), port);
    } finally {
      await closeListener(replacement);
    }
  });
});

test('a startup port conflict closes any compiler and removes its temporary output', testOptions, async () => {
  await withFixture(async fixture => {
    const occupied = http.createServer();
    try {
      const port = await listen(occupied);
      await assert.rejects(fixture.start(port), { code: 'EADDRINUSE' });
      for (const temporaryOutput of fixture.control.state.outputPaths) {
        assert.notEqual(temporaryOutput, fixture.production);
        await assert.rejects(stat(temporaryOutput), { code: 'ENOENT' });
      }
      assert.equal(fixture.control.state.shutdowns, fixture.control.state.outputPaths.length);
      await fixture.assertProductionPreserved();
      await closeListener(occupied);

      const server = await fixture.start(port);
      await readyBundle(server, 'INITIAL_FIXTURE_VALUE');
    } finally {
      await closeListener(occupied);
    }
  });
});

test('invalid ports fail before constructing a compiler or touching production output', testOptions, async () => {
  await withFixture(async fixture => {
    for (const port of [-1, 65536, 1.5, NaN, Infinity]) {
      await assert.rejects(fixture.start(port), /port/i);
    }
    assert.equal(fixture.control.state.outputPaths.length, 0);
    await fixture.assertProductionPreserved();
  });
});
