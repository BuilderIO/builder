import type { BuilderContextInterface } from '../../../context/types';

import type { BuilderContent } from '../../../types/builder-content';

import type { ContentProps } from '../content.types';

import { Slot, component$, useStore } from '@builder.io/qwik';

const MODIFIED_COLUMNS = {
  data: {
    title: 'Columns',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-1253ebf62a87451db1a31e103189b5bb',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-330e798bc0a1405fb04d8a3dce06ff99',
            component: {
              name: 'Text',
              options: { text: '<h3>Stack at tablet</h3>' },
            },
            responsiveStyles: {
              large: {
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flexShrink: '0',
                boxSizing: 'border-box',
                marginTop: '20px',
                lineHeight: 'normal',
                height: 'auto',
                textAlign: 'center',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
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
                        id: 'builder-fa35a394778842b1a9e780a54a3b49a7',
                        component: {
                          name: 'Image',
                          options: {
                            image:
                              'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=990',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            aspectRatio: 0.7004048582995948,
                            lazy: false,
                            srcset:
                              'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=990 990w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=630 630w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F48ad0c7692d940b4b0910420fb78d311?width=586 586w',
                            sizes:
                              '(max-width: 638px) 99vw, (max-width: 998px) 100vw, 42vw',
                          },
                        },
                      },
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-71c14581f362486eb24214d27c0c24d0',
                        component: {
                          name: 'Text',
                          options: {
                            text: 'updated text!',
                          },
                        },
                      },
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-b70d96812f4845268f5a4e9deb4411f2',
                        component: {
                          name: 'Text',
                          options: {
                            text: '<p>more text in column 1</p>',
                          },
                        },
                        responsiveStyles: {
                          large: {
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            flexShrink: '0',
                            boxSizing: 'border-box',
                            marginTop: '20px',
                            lineHeight: 'normal',
                            height: 'auto',
                            textAlign: 'center',
                          },
                        },
                      },
                    ],
                  },
                  {
                    blocks: [],
                  },
                ],
                space: 20,
                stackColumnsAt: 'tablet',
              },
            },
          },
        ],
      },
    ],
  },
  id: 'f24c6940ee5f46458369151cc9ec598c',
};

type BuilderEditorProps = Omit<
  ContentProps,
  'customComponents' | 'data' | 'apiVersion' | 'isSsrAbTest'
> & {
  builderContextSignal: BuilderContextInterface;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};
export const mergeNewContent = function mergeNewContent(
  props,
  state,
  newContent: BuilderContent
) {
  const newContentValue = {
    ...props.builderContextSignal.content,
    ...newContent,
    data: {
      ...props.builderContextSignal.content?.data,
      ...newContent?.data,
    },
    meta: {
      ...props.builderContextSignal.content?.meta,
      ...newContent?.meta,
      breakpoints:
        newContent?.meta?.breakpoints ||
        props.builderContextSignal.content?.meta?.breakpoints,
    },
  };
  console.log('newContentValue', newContentValue);

  props.builderContextSignal.content = newContentValue;
};
export const EnableEditor = component$((props: BuilderEditorProps) => {
  const state = useStore({
    forceReRenderCount: 0,
  });
  return (
    <>
      <div>
        DATA in EnableEditor:{' '}
        {
          props.builderContextSignal!.content!.data!.blocks![0].children![1]
            .component!.options.columns[0].blocks[1].component.options.text
        }
      </div>
      <button
        onClick$={() => {
          mergeNewContent(props, state, MODIFIED_COLUMNS as any);
        }}
      >
        update me
      </button>
      <div key={state.forceReRenderCount}>
        <Slot></Slot>
      </div>
    </>
  );
});

export default EnableEditor;
