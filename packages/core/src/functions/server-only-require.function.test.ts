/**
 * @jest-environment node
 */

const loadServerOnlyRequire = (): NodeRequire => {
  let serverOnlyRequire: NodeRequire;
  jest.isolateModules(() => {
    serverOnlyRequire = require('./server-only-require.function').default;
  });
  return serverOnlyRequire!;
};

describe('serverOnlyRequire', () => {
  afterEach(() => {
    delete (global as any).window;
    jest.restoreAllMocks();
  });

  test('resolves modules outside of the browser', () => {
    expect(loadServerOnlyRequire()('path')).toBe(require('path'));
  });

  test('never calls eval in the browser', () => {
    (global as any).window = {};
    const evalSpy = jest.spyOn(global, 'eval');

    const serverOnlyRequire = loadServerOnlyRequire();

    expect(evalSpy).not.toHaveBeenCalled();
    expect(serverOnlyRequire('path')).toBeNull();
  });
});
