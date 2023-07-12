import { getTopLevelDomain } from './url.js';

describe('getTopLevelDomain', () => {
  test('handles root domain', () => {
    const output = getTopLevelDomain('example.com');
    expect(output).toBe('example.com');
  });
  test('handles subdomain', () => {
    const output = getTopLevelDomain('wwww.example.com');
    expect(output).toBe('example.com');
  });
  test('handles subdomain with long suffix', () => {
    const output = getTopLevelDomain('www.example.co.uk');
    expect(output).toBe('example.co.uk');
  });
  test('handles localhost', () => {
    const output = getTopLevelDomain('localhost');
    expect(output).toBe('localhost');

    const output2 = getTopLevelDomain('127.0.0.1');
    expect(output2).toBe('127.0.0.1');
  });
});
