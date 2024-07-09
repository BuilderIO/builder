import { extractCssVarDefaultValue } from './extract-css-var-default-value';

describe('extractCssVarDefaultValue', () => {
  test('Returns the same value when no CSS variable is present', () => {
    const input = '10px solid black';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('10px solid black');
  });

  test('Extracts the fallback value from a single CSS variable', () => {
    const input = 'var(--primary-color, #000000)';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('#000000');
  });

  test('Extracts nested fallback values', () => {
    const input = 'var(--primary-color, var(--secondary-color, #000000))';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('#000000');
  });

  test('Handles multiple CSS variables in a single string', () => {
    const input = 'var(--font-size, 16px) var(--font-family, sans-serif)';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('16px sans-serif');
  });

  test('Removes CSS variables without fallback values', () => {
    const input = 'var(--primary-color) var(--secondary-color, #000000)';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('#000000');
  });

  test('Handles complex values with multiple nested variables', () => {
    const input =
      'var(--spacing, 8px) var(--color, var(--primary, var(--fallback, #000))) 1px solid';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('8px #000 1px solid');
  });

  test('Handles complex values with multiple nested variables with a function value', () => {
    const input =
      'var(--spacing, 8px) var(--color, var(--primary, var(--fallback, rgb(0, 0, 0)))) 1px solid';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('8px rgb(0, 0, 0) 1px solid');
  });

  test('Preserves whitespace in fallback values', () => {
    const input = 'var(--font-stack, Helvetica, Arial, sans-serif)';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('Helvetica, Arial, sans-serif');
  });

  test('Handles empty input', () => {
    const input = '';
    const result = extractCssVarDefaultValue(input);
    expect(result).toBe('');
  });
});
