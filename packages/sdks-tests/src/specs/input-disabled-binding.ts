// CONTENT: https://builder.io/content/3a4cd1537dd0485a93abfc5b0ab48791/
//          https://cdn.builder.io/api/v3/content/page/3a4cd1537dd0485a93abfc5b0ab48791?apiKey=47e08601f65f4dc8b2d34f109dcce4f0
export const CONTENT = {
  lastUpdatedBy: 'HESl6HBVxFhHEFalzlH4zWRRdkl1',
  folders: [],
  data: {
    jsCode:
      'var __awaiter=function(e,n,t,r){return new(t||(t=Promise))((function(i,o){function a(e){try{l(r.next(e))}catch(e){o(e)}}function u(e){try{l(r.throw(e))}catch(e){o(e)}}function l(e){var n;e.done?i(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(a,u)}l((r=r.apply(e,n||[])).next())}))},__generator=function(e,n){var t,r,i,o,a={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function u(o){return function(u){return function(o){if(t)throw new TypeError("Generator is already executing.");for(;a;)try{if(t=1,r&&(i=2&o[0]?r.return:o[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,o[1])).done)return i;switch(r=0,i&&(o=[2&o[0],i.value]),o[0]){case 0:case 1:i=o;break;case 4:return a.label++,{value:o[1],done:!1};case 5:a.label++,r=o[1],o=[0];continue;case 7:o=a.ops.pop(),a.trys.pop();continue;default:if(!(i=(i=a.trys).length>0&&i[i.length-1])&&(6===o[0]||2===o[0])){a=0;continue}if(3===o[0]&&(!i||o[1]>i[0]&&o[1]<i[3])){a.label=o[1];break}if(6===o[0]&&a.label<i[1]){a.label=i[1],i=o;break}if(i&&a.label<i[2]){a.label=i[2],a.ops.push(o);break}i[2]&&a.ops.pop(),a.trys.pop();continue}o=n.call(e,a)}catch(e){o=[6,e],r=0}finally{t=i=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return state.disabled=!0,Builder.isServer,Builder.isBrowser,[2]}))}))}var _virtual_index=main();return _virtual_index',
    inputs: [
      {
        broadcast: false,
        hideFromUI: false,
        onChange: '',
        hidden: false,
        advanced: false,
        '@type': '@builder.io/core:Field',
        hideFromFieldsEditor: false,
        autoFocus: false,
        type: 'text',
        subFields: [],
        helperText: '',
        mandatory: false,
        required: false,
        permissionsRequiredToEdit: '',
        showIf: '',
        copyOnAdd: true,
        bubble: false,
        showTemplatePicker: true,
        name: 'newField0',
        disallowRemove: false,
        simpleTextOnly: false,
        model: '',
        noPhotoPicker: false,
        supportsAiGeneration: false,
      },
    ],
    themeId: false,
    title: 'input-disable',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-1619df06cf3b4d8995a0ff88f5394424',
        component: {
          name: 'Custom Code',
          options: {
            code: '<style>button[disabled] { border: 1px solid red}</style>',
            scriptsClientOnly: true,
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
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        actions: { click: 'state.disabled=!state.disabled' },
        code: { actions: { click: 'state.disabled = !state.disabled;\n' } },
        id: 'builder-11fdeae35f9a4aea9ad89383d8106581',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:toggleState',
                options: { name: 'disabled' },
              },
            ],
          },
        },
        component: {
          name: 'Core:Button',
          options: { text: 'Toggle button below', openLinkInNewTab: false },
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
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          'component.options.text':
            'var _virtual_index=state.disabled?"input disabled":"input enabled";return _virtual_index',
        },
        code: {
          bindings: {
            'component.options.text':
              'export default state.disabled ? "input disabled" : "input enabled";\n',
          },
        },
        id: 'builder-4fede27731d94ade9e855091b31012d8',
        meta: {
          bindingActions: {
            component: {
              options: {
                text: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:conditionalValue',
                    options: {
                      expression: 'state.disabled',
                      then: 'input disabled',
                      else: 'input enabled',
                    },
                  },
                ],
              },
            },
          },
        },
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
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-d157734f27ec472b85025540e5187dcb',
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
            successMessage: [],
            validate: true,
            errorMessage: [],
            sendingMessage: [],
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            bindings: { disabled: 'var _virtual_index=state.disabled;return _virtual_index' },
            code: { bindings: { disabled: 'state.disabled' } },
            id: 'builder-88f7b3bfbb4c4dc3bdbf5a95a65cba78',
            properties: { disabled: '' },
            component: {
              name: 'Core:Button',
              options: {
                text: "This button should toggle its 'disabled' attribute",
                openLinkInNewTab: false,
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
                backgroundColor: 'black',
                color: 'white',
                borderRadius: '4px',
                textAlign: 'center',
                cursor: 'pointer',
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
      {
        id: 'builder-pixel-3wnrijjml8a',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=47e08601f65f4dc8b2d34f109dcce4f0&contentId=3a4cd1537dd0485a93abfc5b0ab48791&url=%2Finput-dissable',
          'aria-hidden': 'true',
          alt: '',
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
    url: '/input-dissable',
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  modelId: '4e3b1c34918547c6bc82bc6908f21b47',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/input-dissable',
      operator: 'is',
    },
  ],
  published: 'published',
  firstPublished: 1689631887553,
  testRatio: 1,
  lastUpdated: 1689712921313,
  createdDate: 1689630910168,
  createdBy: 'HESl6HBVxFhHEFalzlH4zWRRdkl1',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'https://preview.builder.codes?model=page&previewing=true&apiKey=47e08601f65f4dc8b2d34f109dcce4f0&builder.space=47e08601f65f4dc8b2d34f109dcce4f0&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=3a4cd1537dd0485a93abfc5b0ab48791&builder.overrides.3a4cd1537dd0485a93abfc5b0ab48791=3a4cd1537dd0485a93abfc5b0ab48791&builder.overrides.page:/=3a4cd1537dd0485a93abfc5b0ab48791',
    hasLinks: false,
  },
  variations: {},
  name: 'input-dissable',
  id: '3a4cd1537dd0485a93abfc5b0ab48791',
  rev: '7dersufmx9o',
};
