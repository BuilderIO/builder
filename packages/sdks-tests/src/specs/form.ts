export const FORM = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1706531416024,
  id: '201ab170df214168aee893f98d16e227',
  '@version': 4,
  name: 'form',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'published',
  meta: {
    kind: 'page',
    hasLinks: false,
    lastPreviewUrl:
      'http://localhost:5173/form?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=201ab170df214168aee893f98d16e227&builder.overrides.201ab170df214168aee893f98d16e227=201ab170df214168aee893f98d16e227&builder.overrides.page:/form=201ab170df214168aee893f98d16e227',
  },
  priority: -108,
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/form',
    },
  ],
  data: {
    inputs: [],
    themeId: false,
    title: 'form',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-8be0a6d43e994a328554ac1f2c0dfa13',
        meta: {
          previousId: 'builder-44fb0de975e2439ca734f8ab5f5dee7b',
        },
        component: {
          name: 'Form:Form',
          options: {
            sendSubmissionsTo: 'email',
            sendSubmissionsToEmail: 'your@email.com',
            sendWithJs: true,
            name: 'My form',
            contentType: 'application/json',
            method: 'POST',
            previewState: 'unsubmitted',
            successMessage: [
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                id: 'builder-473f28d358b24dbb8439558325f1609f',
                component: {
                  name: 'Text',
                  options: {
                    text: '<span>Thanks!</span>',
                  },
                },
                responsiveStyles: {
                  large: {
                    marginTop: '10px',
                  },
                },
              },
            ],
            validate: true,
            errorMessage: [
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                bindings: {
                  'component.options.text':
                    'state.formErrorMessage || block.component.options.text',
                },
                id: 'builder-5ecf7581fe4e4c3aa46b8ecf237f6d33',
                component: {
                  name: 'Text',
                  options: {
                    text: '<span>Form submission error :( Please check your answers and try again</span>',
                  },
                },
                responsiveStyles: {
                  large: {
                    marginTop: '10px',
                  },
                },
              },
            ],
            sendingMessage: [
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                id: 'builder-1abb244255284fa7b5b8f935a108b518',
                component: {
                  name: 'Text',
                  options: {
                    text: '<span>Sending...</span>',
                  },
                },
                responsiveStyles: {
                  large: {
                    marginTop: '10px',
                  },
                },
              },
            ],
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-fab721c97a5b4ebbb7ae2a1384f214dd',
            meta: {
              previousId: 'builder-a64b93a4ad3d4d8399c1854601c20943',
            },
            component: {
              name: 'Text',
              options: {
                text: '<span>Enter your name</span>',
              },
            },
            responsiveStyles: {
              large: {
                marginTop: '10px',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-016c2d41abcc433f89ce9850e16762fe',
            meta: {
              previousId: 'builder-9225aafd6d914c198b778e04e3649fab',
            },
            component: {
              name: 'Form:Input',
              options: {
                name: 'name',
                placeholder: 'Jane Doe',
                type: 'text',
                required: true,
              },
            },
            responsiveStyles: {
              large: {
                marginTop: '10px',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-454fc2f8e57b478480f0ece900731be2',
            meta: {
              previousId: 'builder-0edc739b773042209f7c3bee9154e098',
            },
            component: {
              name: 'Text',
              options: {
                text: '<span>Enter your email</span>',
              },
            },
            responsiveStyles: {
              large: {
                marginTop: '10px',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-c1d68b24490c499f82cd33b8ee0d99d6',
            meta: {
              previousId: 'builder-ceda7097668d4b14a9e7c747eb3a1f9f',
            },
            component: {
              name: 'Form:Input',
              options: {
                name: 'email',
                placeholder: 'jane@doe.com',
                required: true,
              },
            },
            responsiveStyles: {
              large: {
                marginTop: '10px',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-ee8acd5a7bd24feb81978781745c661f',
            meta: {
              previousId: 'builder-454fc2f8e57b478480f0ece900731be2',
            },
            component: {
              name: 'Text',
              options: {
                text: '<span>Select an age group</span>',
              },
            },
            responsiveStyles: {
              large: {
                marginTop: '10px',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-4c19ded4a5c54bfda145fddb2d271d1f',
            component: {
              name: 'Form:Select',
              options: {
                options: [
                  {
                    value: '<20',
                    name: '<20',
                  },
                  {
                    value: '20-30',
                    name: '20-30',
                  },
                  {
                    value: '30+',
                    name: '30+',
                  },
                ],
                required: true,
                name: 'age',
                defaultValue: '',
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
                alignSelf: 'flex-start',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-ce1a2b292e18411eba97d3f4118f3822',
            component: {
              name: 'Form:TextArea',
              options: {
                placeholder: 'Hello there',
                required: true,
                name: 'details',
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
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '10px',
                paddingRight: '10px',
                borderRadius: '3px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#ccc',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-a78f837ceb124794abd371d604703593',
            meta: {
              previousId: 'builder-38bed9469b4e4350ba23869003cf3988',
            },
            component: {
              name: 'Form:SubmitButton',
              options: {
                text: 'Submit',
              },
            },
            responsiveStyles: {
              large: {
                marginTop: '10px',
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
            marginTop: '15px',
            paddingBottom: '15px',
          },
        },
      },
    ],
  },
  metrics: {
    clicks: 0,
    impressions: 0,
  },
  variations: {},
  lastUpdated: 1706533418965,
  firstPublished: 1706533418946,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};
