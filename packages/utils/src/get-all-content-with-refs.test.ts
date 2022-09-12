import { builder } from '@builder.io/sdk';
import { getContentWithAllReferences } from './get-all-content-with-refs';

test('Adds async props', async () => {
  const content = [
    {
      createdBy: 'IqzTkBgwWTbzaXDAhTL6IpwiCah1',
      createdDate: 1661750062934,
      data: {
        colors: {
          '@type': '@builder.io/core:Reference',
          id: '740c91c542b047e3965e2c0985cea3f4',
          model: 'color-collection',
          value: [
            {
              createdBy: '4FFFg0MNRJT0z0nW4uUizDHfHJV2',
              createdDate: 1661880406126,
              data: {
                referencelist: [
                  {
                    color: {
                      '@type': '@builder.io/core:Reference',
                      id: '49a879da897a43669a5c6f0aa2313ba2',
                      model: 'color',
                      value: [
                        {
                          createdBy: 'IqzTkBgwWTbzaXDAhTL6IpwiCah1',
                          createdDate: 1661879425538,
                          data: {
                            hex: '#eee333',
                          },
                          id: '49a879da897a43669a5c6f0aa2313ba2',
                          lastUpdatedBy: 'IqzTkBgwWTbzaXDAhTL6IpwiCah1',
                          meta: {
                            kind: 'data',
                          },
                          modelId: '0d42a9e7cb974324b71402a22d29abfa',
                          name: 'second',
                          published: 'published',
                          query: [],
                          testRatio: 1,
                          variations: {},
                          lastUpdated: 1661879432123,
                          firstPublished: 1661879432121,
                          rev: 'ejeap8oqaiv',
                        },
                      ],
                    },
                  },
                  {
                    color: {
                      '@type': '@builder.io/core:Reference',
                      id: '937717f2eccd46b8b7e913225518d3eb',
                      model: 'color',
                      value: [
                        {
                          createdBy: 'IqzTkBgwWTbzaXDAhTL6IpwiCah1',
                          createdDate: 1661879408590,
                          data: {
                            hex: '#111222',
                          },
                          id: '937717f2eccd46b8b7e913225518d3eb',
                          lastUpdatedBy: 'IqzTkBgwWTbzaXDAhTL6IpwiCah1',
                          meta: {
                            kind: 'data',
                          },
                          modelId: '0d42a9e7cb974324b71402a22d29abfa',
                          name: 'first',
                          published: 'published',
                          query: [],
                          testRatio: 1,
                          variations: {},
                          lastUpdated: 1661879420123,
                          firstPublished: 1661879420121,
                          rev: 'u0tjp18phom',
                        },
                      ],
                    },
                  },
                ],
              },
              id: '740c91c542b047e3965e2c0985cea3f4',
              lastUpdatedBy: '4FFFg0MNRJT0z0nW4uUizDHfHJV2',
              meta: {
                kind: 'data',
              },
              modelId: '20aeb14339df47beaca7af65f4d41736',
              name: 'dark theme',
              published: 'published',
              query: [],
              testRatio: 1,
              variations: {},
              lastUpdated: 1661880429436,
              firstPublished: 1661880429435,
              rev: 's8e78mom9te',
            },
          ],
        },
        themeId: false,
        title: 'home',
        url: '/home',
        state: {
          deviceSize: 'large',
          location: {
            host: 'undefined',
            pathname: 'undefined',
            path: [],
            query: {},
          },
        },
      },
      id: '8be720ec67f142508a03a64e777b761a',
      lastUpdatedBy: '4FFFg0MNRJT0z0nW4uUizDHfHJV2',
      modelId: '767e51acd9cd41638c78e8916924a8fb',
      name: 'home',
    },
  ];

  await getContentWithAllReferences(builder, 'page');
  expect(content[0].data.colors.value[0].data.referencelist[0].color.value[0].data.hex).toBe(
    '#eee333'
  );
});
