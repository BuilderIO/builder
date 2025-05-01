import { Builder } from '@builder.io/sdk';
import { stringToFunction, makeFn, getIsolateContext } from './string-to-function';
import * as shouldForceModule from './should-force-browser-runtime-in-node';
import { builder } from '@builder.io/sdk';

jest.mock('./is-debug', () => ({
  isDebug: jest.fn().mockReturnValue(true),
}));

// Mock for isolated-vm module
interface MockReference {
  value: any;
  copySync?: () => any;
}

const mockEvalClosureSync = jest.fn().mockReturnValue('"test"');

jest.mock('./safe-dynamic-require', () => ({
  safeDynamicRequire: jest.fn().mockImplementation(() => ({
    Isolate: class {
      constructor() {}
      createContextSync() {
        return {
          global: {
            setSync: jest.fn(),
            derefInto: jest.fn(),
          },
          evalClosureSync: mockEvalClosureSync,
        };
      }
    },
    Reference: class implements MockReference {
      value: any;
      constructor(val: any) {
        this.value = val;
      }
    },
  })),
}));

describe('makeFn', () => {
  it('should create a function string with default arguments', () => {
    const result = makeFn('state.value', true);
    expect(result).toContain('var state = refToProxy($0);');
    expect(result).toContain('var event = refToProxy($1);');
    expect(result).toContain('var block = refToProxy($2);');
    expect(result).toContain('var builder = refToProxy($3);');
    expect(result).toContain('var Device = refToProxy($4);');
    expect(result).toContain('var update = refToProxy($5);');
    expect(result).toContain('var Builder = refToProxy($6);');
    expect(result).toContain('var context = refToProxy($7);');
    expect(result).toContain('var ctx = context;');
    expect(result).toContain('return (state.value);');
  });

  it('should create a function string with custom arguments', () => {
    const result = makeFn('custom.value', true, ['custom']);
    expect(result).toContain('var custom = refToProxy($0);');
    expect(result).not.toContain('var state = refToProxy($0);');
    expect(result).toContain('return (custom.value);');
  });

  it('should handle non-return expressions', () => {
    const result = makeFn('state.value', false);
    expect(result).toContain('state.value');
    expect(result).not.toContain('return (state.value);');
  });

  it('should include refToProxy function definition', () => {
    const result = makeFn('state.value', true);
    expect(result).toContain('var refToProxy = (obj) => {');
    expect(result).toContain("if (typeof obj !== 'object' || obj === null) {");
    expect(result).toContain('return obj;');
    expect(result).toContain('return new Proxy({}, {');
  });

  it('should include stringify function definition', () => {
    const result = makeFn('state.value', true);
    expect(result).toContain('var stringify = (val) => {');
    expect(result).toContain("if (typeof val === 'object' && val !== null) {");
    expect(result).toContain('return JSON.stringify(val.copySync ? val.copySync() : val);');
  });

  it('should handle context alias correctly', () => {
    const result = makeFn('ctx.value', true, ['state', 'context']);
    expect(result).toContain('var ctx = context;');
  });

  it('should not include context alias when context is not in arguments', () => {
    const result = makeFn('state.value', true, ['state']);
    expect(result).not.toContain('var ctx = context;');
  });

  it('should properly wrap the code in endResult function', () => {
    const result = makeFn('state.value', true);
    expect(result).toContain('var endResult = function() {');
    expect(result).toContain('return stringify(endResult());');
  });
});

describe('getIsolateContext', () => {
  beforeEach(() => {
    Builder.serverContext = undefined;
  });

  it('should create a new context if none exists', () => {
    const context = getIsolateContext();
    expect(context).toBeDefined();
    expect(Builder.serverContext).toBe(context);
  });

  it('should reuse existing context', () => {
    const firstContext = getIsolateContext();
    const secondContext = getIsolateContext();
    expect(secondContext).toBe(firstContext);
  });
});

describe('stringToFunction', () => {
  beforeEach(() => {
    // Reset Builder.isBrowser before each test
    (Builder as any).isBrowser = true;
    jest.clearAllMocks();
  });

  it('should return undefined for empty string', () => {
    const fn = stringToFunction('');
    expect(fn({})).toBeUndefined();
  });

  it('should handle basic expressions', () => {
    const fn = stringToFunction('state.value + 1');
    expect(fn({ value: 1 })).toBe(2);
  });

  it('should handle statements', () => {
    const fn = stringToFunction('let x = state.value; return x + 1;');
    expect(fn({ value: 1 })).toBe(2);
  });

  it('should handle return statements', () => {
    const fn = stringToFunction('return state.value + 1;');
    expect(fn({ value: 1 })).toBe(2);
  });

  it('should handle functions that start with builder.run', () => {
    const mockBuilderObj = {
      getUserAttributes: jest.fn(),
      run: jest.fn().mockReturnValue('ran'),
    } as unknown as Builder;
    const fn = stringToFunction('builder.run()');
    expect(fn({}, undefined, undefined, mockBuilderObj)).toBe('ran');
  });

  it('should handle event parameter', () => {
    const fn = stringToFunction('event.target.value');
    const mockEvent = { target: { value: 'test' } } as unknown as Event;
    expect(fn({}, mockEvent)).toBe('test');
  });

  it('should handle builder parameter', () => {
    const fn = stringToFunction('builder.getUserAttributes()');
    const mockBuilder = { getUserAttributes: () => ({ name: 'test' }) } as unknown as Builder;
    expect(fn({}, undefined, undefined, mockBuilder)).toEqual({ name: 'test' });
  });

  it('should handle context parameter', () => {
    const fn = stringToFunction('ctx.value');
    expect(
      fn({}, undefined, undefined, undefined, undefined, undefined, undefined, { value: 'test' })
    ).toBe('test');
  });

  it('should cache function results', () => {
    const str = 'state.value + 1';
    const fn1 = stringToFunction(str);
    const fn2 = stringToFunction(str);
    expect(fn1).toBe(fn2);
  });

  it('should handle errors gracefully', () => {
    const errors: Error[] = [];
    const fn = stringToFunction('invalid code', true, errors);
    fn({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should push error messages to logs array', () => {
    const logs: string[] = [];
    const errors: Error[] = [];
    // Creating a runtime error by accessing an undefined property
    const fn = stringToFunction('state.undefinedProp.accessSomething', true, errors, logs);
    fn({});
    expect(logs.length).toBeGreaterThan(0);
  });

  it('should handle compilation errors', () => {
    const errors: Error[] = [];
    // Invalid JavaScript that will cause a compilation error
    const fn = stringToFunction('for() {}', true, errors);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should handle functions in contentData', () => {
    const fn = stringToFunction('state.contentData.exampleFunction()');
    expect(
      fn({
        contentData: {
          someString: 'test',
          exampleFunction: () => 'exampleFunctionInvoked',
        },
      })
    ).toBe('exampleFunctionInvoked');
  });

  it('should pass all parameters correctly to the function', () => {
    const fn = stringToFunction(
      'state.value + (event ? 1 : 0) + (block ? 1 : 0) + (builder ? 1 : 0) + (Device ? 1 : 0) + (update ? 1 : 0) + (Builder ? 1 : 0) + (context ? 1 : 0)'
    );

    const mockUpdate = jest.fn();
    const mockDevice = { isMobile: true };
    const mockBlock = { id: 'test-block' };
    const mockEvent = { type: 'click' } as unknown as Event;
    const mockContext = { foo: 'bar' };

    const result = fn(
      { value: 1 },
      mockEvent,
      mockBlock,
      {} as Builder,
      mockDevice,
      mockUpdate,
      Builder,
      mockContext
    );

    // All parameters present = 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 = 8
    expect(result).toBe(8);
  });

  it('should handle the getIsolateContext with existing context', () => {
    // Setup a fake serverContext
    const mockContext = {
      global: {
        setSync: jest.fn(),
        derefInto: jest.fn(),
      },
    };

    Builder.serverContext = mockContext as any;

    // Get the context
    const context = getIsolateContext();

    // Should return the existing context
    expect(context).toBe(mockContext);

    // Reset the context
    Builder.serverContext = undefined;
  });

  it('should handle complex isolated VM execution', () => {
    // Setup a customized mock for evalClosureSync
    mockEvalClosureSync.mockImplementationOnce((code, args) => {
      // Verify that makeFn was called with correct parameters
      expect(code).toContain('refToProxy');
      expect(args.length).toBeGreaterThan(0);

      // Return a valid JSON string to test the JSON.parse path
      return '{"value":"test"}';
    });

    const fn = stringToFunction('state');
    const result = fn({ value: 'test' });

    expect(result).toEqual({ value: 'test' });
  });

  describe('server-side execution', () => {
    beforeEach(() => {
      (Builder as any).isBrowser = false;
      jest.spyOn(shouldForceModule, 'shouldForceBrowserRuntimeInNode').mockReturnValue(false);
      mockEvalClosureSync.mockReset();
      mockEvalClosureSync.mockReturnValue('"test"');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should use isolated VM when not in browser', () => {
      const fn = stringToFunction('state.value');
      expect(fn({ value: 'test' })).toBe('test');
    });

    it('should handle JSON parse errors in server context', () => {
      mockEvalClosureSync.mockReturnValue('not valid json');
      const fn = stringToFunction('state.value');
      expect(fn({ value: 'test' })).toBe('not valid json');
    });

    it('should handle error in server-side execution', () => {
      // Mock the evalClosureSync to throw an error
      const testError = new Error('Server error');
      mockEvalClosureSync.mockImplementation(() => {
        throw testError;
      });

      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      const errors: Error[] = [];

      const fn = stringToFunction('state.value', true, errors);
      const result = fn({ value: 'test' });

      expect(result).toBeNull();
      expect(errors).toContain(testError);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockReset();
    });

    it('should use browser runtime when shouldForceBrowserRuntimeInNode returns true', () => {
      // Instead of testing the warn functionality which is hard to mock properly,
      // let's verify the code path by checking that the browser runtime path works
      // when shouldForceBrowserRuntimeInNode returns true
      jest.spyOn(shouldForceModule, 'shouldForceBrowserRuntimeInNode').mockReturnValue(true);
      (Builder as any).isBrowser = false; // Ensure we're in "server" mode

      // Simple expression that will work in browser mode
      const fn = stringToFunction('state.value + 1');
      expect(fn({ value: 1 })).toBe(2);
    });
  });
});
