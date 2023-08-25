import { getProps } from '@e2e/tests';
import { _processContentResult } from '../../sdk-src';
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import ContentComponent from '~/sdk-src/components/content/content';

export interface MainProps {
  url: string;
}

export const useBuilderContentLoader = routeLoader$(async (event) => {
  const data = await getProps({
    pathname: event.url.pathname,
    _processContentResult,
  });

  if (!data) {
    event.status(404);
  }
  return data;
});

export default component$(() => {
  const contentProps = useBuilderContentLoader();
  return (
    <>
      {contentProps.value ? (
        <ContentComponent
          content={{
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
                                  responsiveStyles: {
                                    large: {
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'stretch',
                                      flexShrink: '0',
                                      position: 'relative',
                                      marginTop: '30px',
                                      textAlign: 'center',
                                      lineHeight: 'normal',
                                      height: 'auto',
                                      minHeight: '20px',
                                      minWidth: '20px',
                                      overflow: 'hidden',
                                    },
                                    small: {
                                      maxHeight: '200px',
                                      maxWidth: '200px',
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
                                      text: '<p>text in column 1</p>',
                                    },
                                  },
                                  responsiveStyles: {
                                    large: {
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'stretch',
                                      flexShrink: '0',
                                      position: 'relative',
                                      marginTop: '30px',
                                      textAlign: 'center',
                                      lineHeight: 'normal',
                                      height: 'auto',
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
                              blocks: [
                                {
                                  '@type': '@builder.io/sdk:Element',
                                  '@version': 2,
                                  id: 'builder-be56c8d76c684759952d6633dafd6bb7',
                                  component: {
                                    name: 'Image',
                                    options: {
                                      image:
                                        'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=990',
                                      backgroundPosition: 'center',
                                      backgroundSize: 'cover',
                                      aspectRatio: 0.7004048582995948,
                                      lazy: false,
                                      srcset:
                                        'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=990 990w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=630 630w, https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fcb698d65565243aabcd89080f6f55bd8?width=586 586w',
                                      sizes:
                                        '(max-width: 638px) 99vw, (max-width: 998px) 100vw, 42vw',
                                    },
                                  },
                                  responsiveStyles: {
                                    large: {
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'stretch',
                                      flexShrink: '0',
                                      position: 'relative',
                                      marginTop: '30px',
                                      textAlign: 'center',
                                      lineHeight: 'normal',
                                      height: 'auto',
                                      minHeight: '20px',
                                      minWidth: '20px',
                                      overflow: 'hidden',
                                    },
                                    small: {
                                      maxHeight: '200px',
                                      maxWidth: '200px',
                                    },
                                  },
                                },
                                {
                                  '@type': '@builder.io/sdk:Element',
                                  '@version': 2,
                                  id: 'builder-a76f13775bfd440e9656226ef820fcd2',
                                  component: {
                                    name: 'Text',
                                    options: {
                                      text: '<p>text in column 2</p>',
                                    },
                                  },
                                  responsiveStyles: {
                                    large: {
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'stretch',
                                      flexShrink: '0',
                                      position: 'relative',
                                      marginTop: '30px',
                                      textAlign: 'center',
                                      lineHeight: 'normal',
                                      height: 'auto',
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                          space: 20,
                          stackColumnsAt: 'tablet',
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
                        },
                      },
                    },
                  ],
                },
              ],
            },
            id: 'f24c6940ee5f46458369151cc9ec598c',
          }}
        />
      ) : (
        <div>Content Not Found</div>
      )}
    </>
  );
});
