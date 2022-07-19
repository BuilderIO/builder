import { generateContentUrl } from '.';

const testKey = 'YJIGb4i01jvw0SRdL5Bt';
const testModel = 'page';
const testId = 'c1b81bab59704599b997574eb0736def';

const options = {
  cachebust: 'true',
  noCache: 'true',
  'overrides.037948e52eaf4743afed464f02c70da4':
    '037948e52eaf4743afed464f02c70da4',
  'overrides.page': '037948e52eaf4743afed464f02c70da4',
  'overrides.page:/': '037948e52eaf4743afed464f02c70da4',
  preview: 'page',
};

describe('Generate Content URL', () => {
  test('generates the proper value for a simple query', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: { id: testId },
    });
    expect(output).toMatchSnapshot();
  });
  test('Handles overrides correctly', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: { id: testId },
      options,
    });
    expect(output).toMatchSnapshot();
  });
});
