export const x = {
  data: {
    gridAssetContainer: 'grid_banner_bottoms',
    fplGlobalCode: 'LIZZOLOVES',
    title: 'Lizzo Loves',
    themeId: false,
    label: 'Lizzo Loves',
    psource: 'lizzoloves',
    inputs: [],
    brand: 'yitty',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-fe4a61127d6042f68f516ab4d99a91d2',
        component: {
          name: 'Columns',
          options: {
            space: 30,
            columns: [
              {
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-91cd963994b44b6e92369267b76474fd',
                    component: { name: 'Text', options: { text: 'Enter some text...' } },
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
              {
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-7d3447c0f2cd444dae0ffeb441d40aee',
                    component: {
                      name: 'Image',
                      options: {
                        image:
                          'https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=998',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        lazy: false,
                        fitContent: true,
                        aspectRatio: 0.666,
                        lockAspectRatio: false,
                        sizes: '(max-width: 638px) 100vw, (max-width: 998px) 100vw, 71vw',
                        height: 1253,
                        width: 1880,
                        srcset:
                          'https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=998 998w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=638 638w, https://cdn.builder.io/api/v1/image/assets%2F74024d7be33d4bbd8808e0788c7710b5%2F4bbb969284564e66b940684b4de89db9?width=985 985w',
                      },
                    },
                    children: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-54a298f9925b4ffb9db278a90e2859a4',
                        component: { name: 'Text', options: { text: '<p>Test Text</p>\n' } },
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
                        width: '100%',
                        minHeight: '400px',
                        minWidth: '20px',
                        overflow: 'hidden',
                      },
                    },
                  },
                ],
              },
            ],
            stackColumnsAt: 'tablet',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-8f40112582b544f7b1c2ea76bd5cc14d',
        component: {
          name: 'Core:Button',
          options: { text: 'Click me!', openLinkInNewTab: false, link: '/womens/bottoms' },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            appearance: 'none',
            paddingTop: '15px',
            paddingBottom: '15px',
            paddingLeft: '25px',
            paddingRight: '25px',
            backgroundColor: 'black',
            color: 'white',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer',
          },
        },
      },
    ],
  },
};
