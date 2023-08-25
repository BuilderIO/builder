import builderContext from '../../../context/builder.context';

import type { BuilderContextInterface } from '../../../context/types';

import { evaluate } from '../../../functions/evaluate/index';

import { fastClone } from '../../../functions/fast-clone';

import { fetchOneEntry } from '../../../functions/get-content/index';

import { fetch } from '../../../functions/get-fetch';

import { isBrowser } from '../../../functions/is-browser';

import { isEditing } from '../../../functions/is-editing';

import { isPreviewing } from '../../../functions/is-previewing';

import { createRegisterComponentMessage } from '../../../functions/register-component';

import { _track } from '../../../functions/track/index';

import { getInteractionPropertiesForEvent } from '../../../functions/track/interaction';

import { logger } from '../../../helpers/logger';

import { checkIsDefined } from '../../../helpers/nullable';

import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../../scripts/init-editing';

import type { BuilderContent } from '../../../types/builder-content';

import type { ComponentInfo } from '../../../types/components';

import type {
  BuilderComponentStateChange,
  ContentProps,
} from '../content.types';

import {
  Slot,
  component$,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from '@builder.io/qwik';

const MODIFIED_COLUMNS = {
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  createdDate: 1644861548711,
  data: {
    title: 'Columns',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-20b0d28f7838498bbc6f660a3d037835',
        component: {
          name: 'Core:Button',
          options: {
            text: 'Go back home',
            link: '/',
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
            appearance: 'none',
            paddingTop: '15px',
            paddingBottom: '15px',
            paddingLeft: '25px',
            paddingRight: '25px',
            backgroundColor: '#3898EC',
            color: 'white',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer',
            marginLeft: 'auto',
          },
          small: {
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-92c438f62b744699bbc818f81454418c',
        component: {
          name: 'Text',
          options: {
            text: '<h1>Columns</h1>',
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
              options: {
                text: '<h3>Stack at tablet</h3>',
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
                            text: 'UPDATED TEXT!',
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
            borderStyle: 'solid',
            borderColor: 'rgba(207, 52, 52, 1)',
            borderWidth: '4px',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-ccb8d32210c04e8c80bc1e7fe1677b7f',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-92317b99fd0b4393adbf59d2337fec8c',
            component: {
              name: 'Text',
              options: {
                text: '<h3>Tablet, reverse</h3>',
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
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-6e2c6a142cd84d8ca3cf88c20f63635b',
            component: {
              name: 'Columns',
              options: {
                columns: [
                  {
                    blocks: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-f6867b68fa5f4fd3bd845509ba0bf196',
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
                            marginTop: '29px',
                            maxWidth: '200px',
                          },
                        },
                      },
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-4d3da6f276d04a29a4910d024ab69b8f',
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
                        id: 'builder-a0ffc4156fa34b9392bdabe63265e986',
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
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-95f6aa245166450f9d6af877656ddde5',
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
                    ],
                  },
                  {
                    blocks: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-e52cbe382c5649949ea3c80618f8a226',
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
                reverseColumnsWhenStacked: true,
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
            borderStyle: 'solid',
            borderColor: 'rgba(52, 191, 207, 1)',
            borderWidth: '4px',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        layerName: 'Box',
        id: 'builder-bbcf573a81fd49aea653e0bde509c325',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-64d3b1c02ba44ba4af4a672a4fc3c23c',
            component: {
              name: 'Text',
              options: {
                text: '<h3>Stack at mobile</h3>',
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
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-d06032a1fb514917add773bd1004392f',
            component: {
              name: 'Columns',
              options: {
                columns: [
                  {
                    blocks: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-69e5c0267cca4dc398f1e15be98e9eb9',
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
                        id: 'builder-d5f1a9f711b242e68e001d2aed4e6e75',
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
                        id: 'builder-b387d9862a944a29a440ea9986a102a1',
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
                        id: 'builder-b425ebd84fea4a3bbf9a387f4b8a2b58',
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
                          },
                        },
                      },
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-60cddbdd0b2f45138b2bf6ec33e68d7f',
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
                stackColumnsAt: 'mobile',
                reverseColumnsWhenStacked: false,
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
            borderStyle: 'solid',
            borderColor: 'rgba(102, 207, 52, 1)',
            borderWidth: '4px',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-86dec6c0db8b487687de2d39d6e7aab9',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-5cae291c046245a9a9c30fc152ba9d39',
            component: {
              name: 'Text',
              options: {
                text: '<h3>Mobile, reverse</h3>',
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
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-652e5e9c32164620ae651b4b8f2938dd',
            component: {
              name: 'Columns',
              options: {
                columns: [
                  {
                    blocks: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-822c0d0cbe7143648ea3f81d40a611c7',
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
                        id: 'builder-6bf2300b907f4f3d9db0af0bd5d0aeaf',
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
                        id: 'builder-6428878b0cfc478291dd9a9dcc373441',
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
                        id: 'builder-c1e86e55860e426a8d943f7beb2cbc8f',
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
                        id: 'builder-74bf2b6acadc4430bda4397db8e9c8a9',
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
                stackColumnsAt: 'mobile',
                reverseColumnsWhenStacked: true,
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
            borderStyle: 'solid',
            borderColor: 'rgba(86, 52, 207, 1)',
            borderWidth: '4px',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-21bd2e55352947afa52243efffda347e',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-3c8548a227ac4a3c99a29f36a48f7c95',
            component: {
              name: 'Text',
              options: {
                text: '<h3>Never stack</h3>',
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
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-0343cf1789b7421f9b64eef4e1ec801f',
            component: {
              name: 'Columns',
              options: {
                columns: [
                  {
                    blocks: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-a965faafa3d046d6846277bbf93524f5',
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
                        id: 'builder-34a2db960cfc4696b3b202eaaf5b4bde',
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
                        id: 'builder-e39d9d6c565e4072aefb532fe18e55d8',
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
                        id: 'builder-11b5a73611354686ba4f9bc092d72723',
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
                        id: 'builder-1355114f2fc841a790826cf4a5af14ad',
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
                stackColumnsAt: 'never',
                reverseColumnsWhenStacked: false,
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
            borderStyle: 'solid',
            borderColor: 'rgba(207, 52, 182, 1)',
            borderWidth: '4px',
          },
        },
      },
      {
        id: 'builder-pixel-29jl3ch956',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
          role: 'presentation',
          width: '0',
          height: '0',
        },
        responsiveStyles: {
          large: {
            height: '0',
            width: '0',
            display: 'inline-block',
            opacity: '0',
            overflow: 'hidden',
            pointerEvents: 'none',
          },
        },
      },
    ],
    url: '/columns',
    state: {
      deviceSize: 'large',
      location: {
        pathname: '/columns',
        path: ['columns'],
        query: {},
      },
    },
  },
  id: 'f24c6940ee5f46458369151cc9ec598c',
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  meta: {
    hasLinks: false,
    kind: 'page',
    needsHydration: false,
  },
  modelId: '240a12053d674735ac2a384dcdc561b5',
  name: 'Columns',
  published: 'published',
  query: [
    {
      '@type': '@builder.io/core:Query',
      operator: 'is',
      property: 'urlPath',
      value: '/columns',
    },
  ],
  testRatio: 1,
  variations: {},
  lastUpdated: 1645030056460,
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F43c3e56ad68647d4b55990d655aeb3f9',
  firstPublished: 1644862675476,
  rev: 'zxiskiseoj',
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
  elementRef,
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
export const processMessage = function processMessage(
  props,
  state,
  elementRef,
  event: MessageEvent
) {
  const { data } = event;
  if (data) {
    switch (data.type) {
      case 'builder.configureSdk': {
        const messageContent = data.data;
        const { breakpoints, contentId } = messageContent;
        if (
          !contentId ||
          contentId !== props.builderContextSignal.content?.id
        ) {
          return;
        }
        if (breakpoints) {
          mergeNewContent(props, state, elementRef, {
            meta: {
              breakpoints,
            },
          });
        }
        state.forceReRenderCount = state.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
        break;
      }
      case 'builder.contentUpdate': {
        console.log('builder.contentUpdate', data);

        const messageContent = data.data;
        const key =
          messageContent.key ||
          messageContent.alias ||
          messageContent.entry ||
          messageContent.modelName;
        const contentData = messageContent.data;
        if (key === props.model) {
          console.log('yeeha');

          mergeNewContent(props, state, elementRef, contentData);
          state.forceReRenderCount = state.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
        }

        break;
      }
    }
  }
};
export const evaluateJsCode = function evaluateJsCode(
  props,
  state,
  elementRef
) {
  // run any dynamic JS code attached to content
  const jsCode = props.builderContextSignal.content?.data?.jsCode;
  if (jsCode) {
    evaluate({
      code: jsCode,
      context: props.context || {},
      localState: undefined,
      rootState: props.builderContextSignal.rootState,
      rootSetState: props.builderContextSignal.rootSetState,
    });
  }
};
export const onClick = function onClick(props, state, elementRef, event: any) {
  if (props.builderContextSignal.content) {
    const variationId = props.builderContextSignal.content?.testVariationId;
    const contentId = props.builderContextSignal.content?.id;
    _track({
      type: 'click',
      canTrack: state.canTrackToUse,
      contentId,
      apiKey: props.apiKey,
      variationId: variationId !== contentId ? variationId : undefined,
      ...getInteractionPropertiesForEvent(event),
      unique: !state.clicked,
    });
  }
  if (!state.clicked) {
    state.clicked = true;
  }
};
export const evalExpression = function evalExpression(
  props,
  state,
  elementRef,
  expression: string
) {
  return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
    evaluate({
      code: group,
      context: props.context || {},
      localState: undefined,
      rootState: props.builderContextSignal.rootState,
      rootSetState: props.builderContextSignal.rootSetState,
    })
  );
};
export const handleRequest = function handleRequest(
  props,
  state,
  elementRef,
  {
    url,
    key,
  }: {
    key: string;
    url: string;
  }
) {
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      const newState = {
        ...props.builderContextSignal.rootState,
        [key]: json,
      };
      props.builderContextSignal.rootSetState?.(newState);
      state.httpReqsData[key] = true;
    })
    .catch((err) => {
      console.error('error fetching dynamic data', url, err);
    });
};
export const runHttpRequests = function runHttpRequests(
  props,
  state,
  elementRef
) {
  const requests: {
    [key: string]: string;
  } = props.builderContextSignal.content?.data?.httpRequests ?? {};
  Object.entries(requests).forEach(([key, url]) => {
    if (url && (!state.httpReqsData[key] || isEditing())) {
      const evaluatedUrl = evalExpression(props, state, elementRef, url);
      handleRequest(props, state, elementRef, {
        url: evaluatedUrl,
        key,
      });
    }
  });
};
export const emitStateUpdate = function emitStateUpdate(
  props,
  state,
  elementRef
) {
  if (isEditing()) {
    window.dispatchEvent(
      new CustomEvent<BuilderComponentStateChange>(
        'builder:component:stateChange',
        {
          detail: {
            state: fastClone(props.builderContextSignal.rootState),
            ref: {
              name: props.model,
            },
          },
        }
      )
    );
  }
};
export const EnableEditor = component$((props: BuilderEditorProps) => {
  const elementRef = useSignal<Element>();
  const state = useStore<any>(
    {
      canTrackToUse: checkIsDefined(props.canTrack) ? props.canTrack : true,
      clicked: false,
      forceReRenderCount: 0,
      httpReqsData: {},
      lastUpdated: 0,
      shouldSendResetCookie: false,
    },
    { deep: true }
  );
  useContextProvider(builderContext, {});
  useVisibleTask$(() => {
    if (!props.apiKey) {
      logger.error(
        'No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
      );
    }
    if (isBrowser()) {
      if (isEditing()) {
        state.forceReRenderCount = state.forceReRenderCount + 1;
        window.addEventListener(
          'message',
          processMessage.bind(null, props, state, elementRef)
        );
        registerInsertMenu();
        setupBrowserForEditing({
          ...(props.locale
            ? {
                locale: props.locale,
              }
            : {}),
          ...(props.includeRefs
            ? {
                includeRefs: props.includeRefs,
              }
            : {}),
          ...(props.enrich
            ? {
                enrich: props.enrich,
              }
            : {}),
        });
        Object.values<ComponentInfo>(
          props.builderContextSignal.componentInfos
        ).forEach((registeredComponent) => {
          const message = createRegisterComponentMessage(registeredComponent);
          window.parent?.postMessage(message, '*');
        });
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          emitStateUpdate.bind(null, props, state, elementRef)
        );
      }
      if (props.builderContextSignal.content) {
        const variationId = props.builderContextSignal.content?.testVariationId;
        const contentId = props.builderContextSignal.content?.id;
        _track({
          type: 'impression',
          canTrack: state.canTrackToUse,
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }
      // override normal content in preview mode
      if (isPreviewing()) {
        const searchParams = new URL(location.href).searchParams;
        const searchParamPreviewModel = searchParams.get('builder.preview');
        const searchParamPreviewId = searchParams.get(
          `builder.preview.${searchParamPreviewModel}`
        );
        const previewApiKey =
          searchParams.get('apiKey') || searchParams.get('builder.space');

        /**
         * Make sure that:
         * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered
         *  at the same time, e.g. header/page/footer.
         * - the API key is the same, since we don't want to preview content from other organizations.
         * - if there is content, that the preview ID is the same as that of the one we receive.
         *
         * TO-DO: should we only update the state when there is a change?
         **/
        if (
          searchParamPreviewModel === props.model &&
          previewApiKey === props.apiKey &&
          (!props.content || searchParamPreviewId === props.content.id)
        ) {
          fetchOneEntry({
            model: props.model,
            apiKey: props.apiKey,
            apiVersion: props.builderContextSignal.apiVersion,
          }).then((content) => {
            if (content) {
              mergeNewContent(props, state, elementRef, content);
            }
          });
        }
      }
      evaluateJsCode(props, state, elementRef);
      runHttpRequests(props, state, elementRef);
      emitStateUpdate(props, state, elementRef);
    }
  });
  useTask$(({ track }) => {
    track(() => props.content);
    if (props.content) {
      mergeNewContent(props, state, elementRef, props.content);
    }
  });
  useTask$(({ track }) => {
    track(() => state.shouldSendResetCookie);
  });
  useTask$(({ track }) => {
    track(() => props.builderContextSignal.content?.data?.jsCode);
    track(() => props.builderContextSignal.rootState);
    evaluateJsCode(props, state, elementRef);
  });
  useTask$(({ track }) => {
    track(() => props.builderContextSignal.content?.data?.httpRequests);
    runHttpRequests(props, state, elementRef);
  });
  useTask$(({ track }) => {
    track(() => props.builderContextSignal.rootState);
    emitStateUpdate(props, state, elementRef);
  });

  return (
    <>
      <div>
        DATA in EnableEditor:{' '}
        {
          props.builderContextSignal!.content!.data!.blocks![2].children![1]
            .component!.options.columns[0].blocks[1].component.options.text
        }
      </div>
      <button
        onClick$={() => {
          mergeNewContent(props, state, elementRef, MODIFIED_COLUMNS as any);
          if (window.location.href.includes('columns')) {
            // const newContent = { ...props.builderContextSignal.content }
            // // @ts-ignore
            // newContent.data.blocks[2].children[1].component.options.columns[0].blocks[1].component.options.text =  'IT WORKS!!';
            // props.builderContextSignal.content = newContent;
          } else {
            // @ts-ignore
            // props.builderContextSignal.content.data.blocks[0].children[0].component.options.text = 'IT WORKS!!';
          }
        }}
      >
        update me
      </button>
      {props.builderContextSignal.content ? (
        <div
          key={state.forceReRenderCount}
          ref={elementRef}
          onClick$={(event) => onClick(props, state, elementRef, event)}
          builder-content-id={props.builderContextSignal.content?.id}
          builder-model={props.model}
          {...{}}
          {...(props.showContent
            ? {}
            : {
                hidden: true,
                'aria-hidden': true,
              })}
          class={props.classNameProp}
        >
          <Slot></Slot>
        </div>
      ) : null}
    </>
  );
});

export default EnableEditor;
