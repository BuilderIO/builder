export const COLLEGE_RESULTS_REPEAT = {
  data: {
    jsCode: '',
    inputs: [],
    state: {
      college: {
        results: [
          { id: 1, name: 'Stanford University', ranking: 1, location: 'California' },
          { id: 2, name: 'MIT', ranking: 2, location: 'Massachusetts' },
          { id: 3, name: 'Harvard University', ranking: 3, location: 'Massachusetts' },
          { id: 4, name: 'Princeton University', ranking: 4, location: 'New Jersey' },
          { id: 5, name: 'Yale University', ranking: 5, location: 'Connecticut' },
        ],
      },
    },
    themeId: false,
    title: 'College Results with Repeat',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-header-container',
        component: {
          name: 'Text',
          options: {
            text: '<h1>Top Colleges</h1>',
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
            marginBottom: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        repeat: { collection: 'state.college.results' },
        id: 'builder-college-repeat-container',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-college-card',
            responsiveStyles: {
              large: {
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flexShrink: '0',
                boxSizing: 'border-box',
                marginTop: '10px',
                marginBottom: '10px',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                bindings: {
                  'component.options.text':
                    'var _virtual_index = "Rank #" + state.college.results[state.$index].ranking + ": " + state.college.results[state.$index].name; return _virtual_index',
                },
                code: {
                  bindings: {
                    'component.options.text':
                      '"Rank #" + state.college.results[state.$index].ranking + ": " + state.college.results[state.$index].name',
                  },
                },
                id: 'builder-college-name',
                component: {
                  name: 'Text',
                  options: { text: 'College Name' },
                },
                responsiveStyles: {
                  large: {
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    flexShrink: '0',
                    boxSizing: 'border-box',
                    marginTop: '5px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  },
                },
              },
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                bindings: {
                  'component.options.text':
                    'var _virtual_index = "Location: " + state.college.results[state.$index].location; return _virtual_index',
                },
                code: {
                  bindings: {
                    'component.options.text':
                      '"Location: " + state.college.results[state.$index].location',
                  },
                },
                id: 'builder-college-location',
                component: {
                  name: 'Text',
                  options: { text: 'Location' },
                },
                responsiveStyles: {
                  large: {
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    flexShrink: '0',
                    boxSizing: 'border-box',
                    marginTop: '5px',
                    fontSize: '14px',
                    color: '#666',
                  },
                },
              },
            ],
          },
        ],
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '10px',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
            maxWidth: '800px',
          },
        },
      },
    ],
  },
};


