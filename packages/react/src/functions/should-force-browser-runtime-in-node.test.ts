import { shouldForceBrowserRuntimeInNode } from './should-force-browser-runtime-in-node';

describe('shouldForceBrowserRuntimeInNode', () => {
  const originalArch = process.arch;
  const originalVersion = process.version;
  const originalNodeOptions = process.env.NODE_OPTIONS;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Mock console.log to prevent actual logging during tests
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore original process properties
    Object.defineProperty(process, 'arch', { value: originalArch });
    Object.defineProperty(process, 'version', { value: originalVersion });
    process.env.NODE_OPTIONS = originalNodeOptions;
    console.log = originalConsoleLog;
  });

  it('should return false when not in Node runtime', () => {
    // Save original process
    const originalProcess = global.process;

    try {
      // Mock not being in Node runtime
      // @ts-ignore - Intentionally modifying global.process for test
      global.process = undefined;

      expect(shouldForceBrowserRuntimeInNode()).toBe(false);
    } finally {
      // Restore original process
      global.process = originalProcess;
    }
  });

  it('should return false when not on arm64 architecture', () => {
    Object.defineProperty(process, 'arch', { value: 'x64' });
    Object.defineProperty(process, 'version', { value: 'v20.0.0' });
    expect(shouldForceBrowserRuntimeInNode()).toBe(false);
  });

  it('should return false when not on Node 20', () => {
    Object.defineProperty(process, 'arch', { value: 'arm64' });
    Object.defineProperty(process, 'version', { value: 'v18.0.0' });
    expect(shouldForceBrowserRuntimeInNode()).toBe(false);
  });

  it('should return false when on arm64 and Node 20 but has no-node-snapshot option', () => {
    Object.defineProperty(process, 'arch', { value: 'arm64' });
    Object.defineProperty(process, 'version', { value: 'v20.0.0' });
    process.env.NODE_OPTIONS = '--no-node-snapshot';
    expect(shouldForceBrowserRuntimeInNode()).toBe(false);
  });

  it('should return true and log warning when on arm64, Node 20, and no snapshot option flag', () => {
    Object.defineProperty(process, 'arch', { value: 'arm64' });
    Object.defineProperty(process, 'version', { value: 'v20.0.0' });
    process.env.NODE_OPTIONS = '';

    const result = shouldForceBrowserRuntimeInNode();

    expect(result).toBe(true);
    expect(console.log).toHaveBeenCalled();
  });
});
