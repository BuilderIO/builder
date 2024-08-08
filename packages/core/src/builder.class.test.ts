import { Builder } from './builder.class';

describe('Builder', () => {
  test('trustedHosts', () => {
    expect(Builder.isTrustedHost('localhost')).toBe(true);
    expect(Builder.isTrustedHost('builder.io')).toBe(true);
    expect(Builder.isTrustedHost('beta.builder.io')).toBe(true);
    expect(Builder.isTrustedHost('qa.builder.io')).toBe(true);
    expect(Builder.isTrustedHost('123-review-build.beta.builder.io')).toBe(true);
  });

  test('arbitrary builder.io subdomains', () => {
    expect(Builder.isTrustedHost('cdn.builder.io')).toBe(false);
    expect(Builder.isTrustedHost('foo.builder.io')).toBe(false);
    expect(Builder.isTrustedHost('evildomainbeta.builder.io')).toBe(false);
  });

  test('add trusted host', () => {
    expect(Builder.isTrustedHost('example.com')).toBe(false);
    Builder.registerTrustedHost('example.com');
    expect(Builder.isTrustedHost('example.com')).toBe(true);
  });
});

describe('serializeComponentInfo', () => {
  test('serializes functions in inputs', () => {
    const input = {
      name: 'TestComponent',
      inputs: [
        {
          name: 'text',
          type: 'string',
          onChange: function (value: string) {
            return value.toUpperCase();
          },
        },
      ],
    };

    const result = Builder['serializeComponentInfo'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('return value.toUpperCase()');
  });

  test('serializes arrow functions in inputs', () => {
    const input = {
      name: 'ArrowComponent',
      inputs: [
        {
          name: 'number',
          type: 'number',
          onChange: (value: number) => value * 2,
        },
      ],
    };

    const result = Builder['serializeComponentInfo'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('value * 2');
  });

  test('does not modify non-function properties', () => {
    const input = {
      name: 'MixedComponent',
      inputs: [
        {
          name: 'text',
          type: 'string',
          defaultValue: 'hello',
        },
      ],
    };

    const result = Builder['serializeComponentInfo'](input);

    expect(result).toEqual(input);
  });

  test('handles multiple inputs with mixed properties', () => {
    const input = {
      name: 'ComplexComponent',
      inputs: [
        {
          name: 'text',
          type: 'string',
          onChange: (value: string) => value.trim(),
        },
        {
          name: 'number',
          type: 'number',
          defaultValue: 42,
        },
        {
          name: 'options',
          type: 'string',
          onChange: function (value: string[]) {
            return value.map(v => v.toLowerCase());
          },
        },
      ],
    };

    const result = Builder['serializeComponentInfo'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('value.trim()');

    expect(result.inputs[1]).toEqual(input.inputs[1]);

    expect(typeof result.inputs[2].onChange).toBe('string');
    expect(result.inputs[2].onChange).toContain('v.toLowerCase()');
  });
});

describe('prepareComponentSpecToSend', () => {
  test('removes class property and serializes functions in inputs', () => {
    const input = {
      name: 'TestComponent',
      class: class TestClass {},
      inputs: [
        {
          name: 'text',
          type: 'string',
          onChange: function (value: string) {
            return value.toUpperCase();
          },
        },
      ],
    };

    const result = Builder['prepareComponentSpecToSend'](input);

    expect(result.class).toBeUndefined();
    expect(typeof result.inputs?.[0].onChange).toBe('string');
    expect(result.inputs?.[0].onChange).toContain('value.toUpperCase()');
  });

  test('preserves other properties', () => {
    const input = {
      name: 'ComplexComponent',
      class: class ComplexClass {},
      inputs: [
        {
          name: 'text',
          type: 'string',
          defaultValue: 'hello',
          onChange: (value: string) => value.trim(),
        },
        {
          name: 'number',
          type: 'number',
          defaultValue: 42,
        },
      ],
    };

    const result = Builder['prepareComponentSpecToSend'](input);

    expect(result.class).toBeUndefined();
    expect(result.name).toBe('ComplexComponent');
    expect(result.inputs?.length).toBe(2);
    expect(typeof result.inputs?.[0].onChange).toBe('string');
    expect(result.inputs?.[0].onChange).toContain('value.trim()');
    expect(result.inputs?.[0].defaultValue).toBe('hello');
    expect(result.inputs?.[1]).toEqual(input.inputs[1]);
  });
});
