import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { getTestCookie } from '../content-variants.js';
import { getGlobalBuilderContext } from '../global-context.js';
import { _track } from '../track/index.js';
import { flattenState, getBuilderGlobals } from './helpers';

// Mock dependencies
vi.mock('../track/index.js', () => ({
  _track: vi.fn(),
}));

vi.mock('../global-context.js', () => ({
  getGlobalBuilderContext: vi.fn(),
}));

vi.mock('../content-variants.js', () => ({
  getTestCookie: vi.fn(),
}));

vi.mock('../../helpers/canTrack.js', () => ({
  getDefaultCanTrack: vi.fn(),
}));

describe('getBuilderGlobals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGlobalBuilderContext).mockReturnValue({});
    vi.mocked(getDefaultCanTrack).mockReturnValue(true);
    vi.mocked(getTestCookie).mockReturnValue(undefined);
  });

  describe('track function', () => {
    it('should call _track with correct parameters', () => {
      const builderGlobals = getBuilderGlobals();
      const mockContext = {
        apiHost: 'https://test.builder.io',
        apiKey: 'test-api-key',
      };

      vi.mocked(getGlobalBuilderContext).mockReturnValue(mockContext);
      vi.mocked(getDefaultCanTrack).mockReturnValue(true);

      builderGlobals.track('click', { customProp: 'value' }, { userId: '123' });

      expect(_track).toHaveBeenCalledWith({
        type: 'click',
        customProp: 'value',
        apiHost: 'https://test.builder.io',
        apiKey: 'test-api-key',
        context: { userId: '123' },
        canTrack: true,
      });
    });

    it('should use empty string for apiKey when not provided', () => {
      const builderGlobals = getBuilderGlobals();
      vi.mocked(getGlobalBuilderContext).mockReturnValue({
        apiHost: 'https://test.builder.io',
      });

      builderGlobals.track('pageview', {});

      expect(_track).toHaveBeenCalledWith({
        type: 'pageview',
        apiHost: 'https://test.builder.io',
        apiKey: '',
        context: undefined,
        canTrack: true,
      });
    });

    it('should work with no properties provided', () => {
      const builderGlobals = getBuilderGlobals();

      builderGlobals.track('custom-event', {});

      expect(_track).toHaveBeenCalledWith({
        type: 'custom-event',
        apiHost: undefined,
        apiKey: '',
        context: undefined,
        canTrack: true,
      });
    });
  });

  describe('trackConversion function', () => {
    it('should call _track with conversion type and all parameters', () => {
      const builderGlobals = getBuilderGlobals();
      const mockContext = {
        apiHost: 'https://test.builder.io',
        apiKey: 'test-api-key',
        contentId: 'content-123',
      };

      vi.mocked(getGlobalBuilderContext).mockReturnValue(mockContext);
      vi.mocked(getDefaultCanTrack).mockReturnValue(true);

      builderGlobals.trackConversion(
        100,
        'content-456',
        'variation-789',
        { product: 'shoes' },
        { userId: '123' }
      );

      expect(_track).toHaveBeenCalledWith({
        type: 'conversion',
        apiHost: 'https://test.builder.io',
        apiKey: 'test-api-key',
        amount: 100,
        contentId: 'content-456',
        variationId: 'variation-789',
        meta: { product: 'shoes' },
        context: { userId: '123' },
        canTrack: true,
      });
    });

    it('should use contentId from global context when not provided', () => {
      const builderGlobals = getBuilderGlobals();
      const mockContext = {
        apiKey: 'test-api-key',
        contentId: 'global-content-123',
      };

      vi.mocked(getGlobalBuilderContext).mockReturnValue(mockContext);

      builderGlobals.trackConversion(50);

      expect(_track).toHaveBeenCalledWith({
        type: 'conversion',
        apiHost: undefined,
        apiKey: 'test-api-key',
        amount: 50,
        contentId: 'global-content-123',
        variationId: undefined,
        meta: undefined,
        context: undefined,
        canTrack: true,
      });
    });

    it('should handle contentId as object (legacy format)', () => {
      const builderGlobals = getBuilderGlobals();
      const metaObject = { product: 'shoes', category: 'footwear' };

      vi.mocked(getGlobalBuilderContext).mockReturnValue({
        apiKey: 'test-key',
      });

      builderGlobals.trackConversion(75, metaObject, 'variation-123');

      expect(_track).toHaveBeenCalledWith({
        type: 'conversion',
        apiHost: undefined,
        apiKey: 'test-key',
        amount: 75,
        contentId: undefined,
        variationId: undefined, // variationId is undefined because contentId is undefined
        meta: metaObject,
        context: undefined,
        canTrack: true,
      });
    });

    it('should get variationId from test cookie when not provided', () => {
      const builderGlobals = getBuilderGlobals();

      vi.mocked(getGlobalBuilderContext).mockReturnValue({
        apiKey: 'test-key',
      });
      vi.mocked(getTestCookie).mockReturnValue('cookie-variation-456');

      builderGlobals.trackConversion(25, 'content-789');

      expect(getTestCookie).toHaveBeenCalledWith('content-789');
      expect(_track).toHaveBeenCalledWith({
        type: 'conversion',
        apiHost: undefined,
        apiKey: 'test-key',
        amount: 25,
        contentId: 'content-789',
        variationId: 'cookie-variation-456',
        meta: undefined,
        context: undefined,
        canTrack: true,
      });
    });

    it('should not set variationId when it equals contentId', () => {
      const builderGlobals = getBuilderGlobals();

      vi.mocked(getGlobalBuilderContext).mockReturnValue({
        apiKey: 'test-key',
      });

      builderGlobals.trackConversion(30, 'content-123', 'content-123');

      expect(_track).toHaveBeenCalledWith({
        type: 'conversion',
        apiHost: undefined,
        apiKey: 'test-key',
        amount: 30,
        contentId: 'content-123',
        variationId: undefined,
        meta: undefined,
        context: undefined,
        canTrack: true,
      });
    });

    it('should handle all parameters as undefined', () => {
      const builderGlobals = getBuilderGlobals();

      vi.mocked(getGlobalBuilderContext).mockReturnValue({});

      builderGlobals.trackConversion();

      expect(_track).toHaveBeenCalledWith({
        type: 'conversion',
        apiHost: undefined,
        apiKey: '',
        amount: undefined,
        contentId: undefined,
        variationId: undefined,
        meta: undefined,
        context: undefined,
        canTrack: true,
      });
    });

    it('should prioritize provided contentId over global context', () => {
      const builderGlobals = getBuilderGlobals();
      const mockContext = {
        apiKey: 'test-key',
        contentId: 'global-content-123',
      };

      vi.mocked(getGlobalBuilderContext).mockReturnValue(mockContext);

      builderGlobals.trackConversion(100, 'explicit-content-456');

      expect(_track).toHaveBeenCalledWith({
        type: 'conversion',
        apiHost: undefined,
        apiKey: 'test-key',
        amount: 100,
        contentId: 'explicit-content-456',
        variationId: undefined,
        meta: undefined,
        context: undefined,
        canTrack: true,
      });
    });
  });
});

describe('flatten state', () => {
  it('should behave normally when no PROTO_STATE', () => {
    const localState = {};
    const rootState = { foo: 'bar' };
    const flattened = flattenState({
      rootState,
      localState,
      rootSetState: undefined,
    });
    expect(flattened.foo).toEqual('bar');
    flattened.foo = 'baz';
    expect(rootState.foo).toEqual('baz');
  });

  it('should shadow write ', () => {
    const rootState = { foo: 'foo' };
    const localState = { foo: 'baz' };
    const flattened = flattenState({
      rootState,
      localState,
      rootSetState: undefined,
    });
    expect(() => (flattened.foo = 'bar')).toThrow(
      'Writing to local state is not allowed as it is read-only.'
    );
  });

  it('should correctly handle null state values', () => {
    const localState = {};
    const rootState = { foo: null };
    const flattened = flattenState({
      rootState,
      localState,
      rootSetState: undefined,
    });
    expect(flattened.foo).toEqual(null);
  });
});
