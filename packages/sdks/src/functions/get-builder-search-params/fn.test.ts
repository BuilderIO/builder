import { convertSearchParamsToQueryObject, getBuilderSearchParams } from '.';

const querystring =
  'someotherValue=jklsjfdal&abc=klfdjklgfds&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=037948e52eaf4743afed464f02c70da4&builder.overrides.037948e52eaf4743afed464f02c70da4=037948e52eaf4743afed464f02c70da4&builder.overrides.page%3A%2F=037948e52eaf4743afed464f02c70da4&preview_theme_id=128854393017';

const url = new URL(`localhost:3000/about-us?${querystring}`);

describe('Get Builder SearchParams', () => {
  test('correctly converts URLSearchParams to object', () => {
    const output = convertSearchParamsToQueryObject(url.searchParams);
    expect(output).toMatchSnapshot();
  });
  test('correctly extracts all builder params from a query object', () => {
    const output = getBuilderSearchParams(
      convertSearchParamsToQueryObject(url.searchParams)
    );
    expect(output).toMatchSnapshot();
  });
});
