import { component$ } from '@builder.io/qwik';
import ContentComponent from '~/sdk-src/components/content/content';

export default component$(() => {
  return (
    <ContentComponent
      content={{
        data: {
          title: 'Columns',
          blocks: [
            {
              '@type': '@builder.io/sdk:Element',
              id: 'builder-25c64e9c18804f46b73985264df3c41c',
              component: {
                name: 'Columns',
                options: {
                  columns: [
                    {
                      blocks: [
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          id: 'builder-71c14581f362486eb24214d27c0c24d0',
                          component: {
                            name: 'Text',
                            options: { text: '<p>text in column 1</p>' },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
        id: 'f24c6940ee5f46458369151cc9ec598c',
      }}
      showContent={true}
      classNameProp={undefined}
      data={undefined}
      context={undefined}
      apiVersion={undefined}
      customComponents={undefined}
      canTrack={undefined}
      locale={undefined}
      includeRefs={undefined}
      enrich={undefined}
      isSsrAbTest={false}
    />
  );
});
