import { parse } from './url';
import { parse as oldParse } from 'url';

describe('.parse', () => {
  test('can parse a full url', async () => {
    expect(parse('http://example.com/foo/bar?q=1')).toEqual({
      auth: null,
      hash: null,
      host: 'example.com',
      hostname: 'example.com',
      href: 'http://example.com/foo/bar?q=1',
      path: '/foo/bar?q=1',
      pathname: '/foo/bar',
      port: null,
      protocol: 'http:',
      query: 'q=1',
      search: '?q=1',
      slashes: true,
    });
  });

  test('can parse a path', async () => {
    expect(parse('/foo/bar?q=1')).toEqual({
      auth: null,
      hash: null,
      host: null,
      hostname: null,
      href: '/foo/bar?q=1',
      path: '/foo/bar?q=1',
      pathname: '/foo/bar',
      port: null,
      protocol: null,
      query: 'q=1',
      search: '?q=1',
      slashes: null,
    });
  });

  test('can parse a url that is missing slashes', async () => {
    expect(parse('http:example.com/foo/bar?q=1')).toEqual({
      auth: null,
      hash: null,
      host: 'example.com',
      hostname: 'example.com',
      href: 'http://example.com/foo/bar?q=1',
      path: '/foo/bar?q=1',
      pathname: '/foo/bar',
      port: null,
      protocol: 'http:',
      query: 'q=1',
      search: '?q=1',
      slashes: false,
    });
  });

  describe('behaves the same as the old query function', () => {
    describe.each([{ url: '/foo/bar?a=1&b=2' }, { url: 'http://example.com/foo/bar?a=1&b=2' }])(
      'with url `$url`',
      ({ url }) => {
        const expected = Object.assign({}, oldParse(url));
        const actual = parse(url);

        test.each([
          { prop: 'query' },
          { prop: 'port' },
          { prop: 'auth' },
          { prop: 'hash' },
          { prop: 'host' },
          { prop: 'hostname' },
          { prop: 'href' },
          { prop: 'path' },
          { prop: 'pathname' },
          { prop: 'protocol' },
          { prop: 'search' },
          { prop: 'slashes' },
        ] as const)('`$prop` is the same', async ({ prop }) => {
          expect(actual[prop]).toEqual(expected[prop]);
        });
      }
    );
  });
});
