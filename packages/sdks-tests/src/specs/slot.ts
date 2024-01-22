export const SLOT = {
  data: {
    title: 'make-a-slot',
    themeId: false,
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-f9f470d1e090475a9861cc3d72cd1570',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              data: {
                children: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-b7472010a58c43bcb26cbfe47be029b5',
                    component: { name: 'Text', options: { text: 'Inside a slot!!' } },
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
                      },
                    },
                  },
                ],
              },
              model: 'symbol',
              entry: '6926ca2352d24d3286f1af71561cbb01',
              content: {
                data: {
                  inputs: [],
                  blocks: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      layerName: 'Box',
                      id: 'builder-9ed1dc540413452e9b1cbbfca23b9120',
                      meta: { previousId: 'builder-53dcfbf8c0c244dfa59cc90352d1d866' },
                      children: [
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          id: 'builder-4dcd66ea89804532b83d2c4f5b49cbeb',
                          meta: { previousId: 'builder-dca44eb6e65b46629fad4d9beed45db3' },
                          component: { name: 'Text', options: { text: 'Hello world!' } },
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
                            },
                          },
                        },
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          layerName: 'Slot',
                          id: 'builder-ecfff164c74a44a89f87ee03e6d2e5c4',
                          component: { name: 'Slot', options: { name: 'children' } },
                          responsiveStyles: {
                            large: {
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              flexShrink: '0',
                              boxSizing: 'border-box',
                              marginTop: '20px',
                            },
                          },
                        },
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          id: 'builder-dca44eb6e65b46629fad4d9beed45db3',
                          meta: { previousId: 'builder-9c9cdb77fd014a1188b16188096074cc' },
                          component: { name: 'Text', options: { text: 'Hello world!' } },
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
                            },
                          },
                        },
                      ],
                      responsiveStyles: {
                        large: {
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          flexShrink: '0',
                          boxSizing: 'border-box',
                          marginTop: '20px',
                          height: 'auto',
                          paddingBottom: '30px',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ],
  },
};
