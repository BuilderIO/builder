// CONTENT: https://cdn.builder.io/api/v3/content/page/bc00782838e048a9b9e8e840a4a4d0c2?apiKey=47e08601f65f4dc8b2d34f109dcce4f0
export const CONTENT = {
  lastUpdatedBy: 'HESl6HBVxFhHEFalzlH4zWRRdkl1',
  folders: [],
  data: {
    jsCode:
      'var __awaiter=function(e,t,n,r){return new(n||(n=Promise))((function(i,a){function o(e){try{l(r.next(e))}catch(e){a(e)}}function u(e){try{l(r.throw(e))}catch(e){a(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,u)}l((r=r.apply(e,t||[])).next())}))},__generator=function(e,t){var n,r,i,a,o={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return a={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function u(a){return function(u){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;o;)try{if(n=1,r&&(i=2&a[0]?r.return:a[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,a[1])).done)return i;switch(r=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return o.label++,{value:a[1],done:!1};case 5:o.label++,r=a[1],a=[0];continue;case 7:a=o.ops.pop(),o.trys.pop();continue;default:if(!(i=(i=o.trys).length>0&&i[i.length-1])&&(6===a[0]||2===a[0])){o=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){o.label=a[1];break}if(6===a[0]&&o.label<i[1]){o.label=i[1],i=a;break}if(i&&o.label<i[2]){o.label=i[2],o.ops.push(a);break}i[2]&&o.ops.pop(),o.trys.pop();continue}a=t.call(e,o)}catch(e){a=[6,e],r=0}finally{n=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return state.name="initial Name",state.list=["first","second"],Builder.isServer,Builder.isBrowser,[2]}))}))}var _virtual_index=main();return _virtual_index',
    inputs: [],
    themeId: false,
    title: 'qwik-sdk-events',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: { 'component.options.text': 'state.name' },
        code: {
          bindings: {
            'component.options.text':
              '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.name;\n',
          },
        },
        id: 'builder-acd0aa86d9ca4fac908b223b28874025',
        meta: {
          bindingActions: {
            component: {
              options: {
                text: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:customCode',
                    options: {
                      code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.name',
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
        actions: { click: 'state.name="updated text"' },
        code: { actions: { click: 'state.name = "updated text";\n' } },
        id: 'builder-a5e821841dbb4b1aa5ca297adf1bb2eb',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:setState',
                options: { value: 'updated text', name: 'name' },
              },
            ],
          },
        },
        component: {
          name: 'Core:Button',
          options: { text: 'Change Name', openLinkInNewTab: false },
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
        actions: { click: 'state.name="repeated set"' },
        bindings: {
          'component.options.text':
            'var _virtual_index=state.listItem+": (click me to change `name`)";return _virtual_index',
        },
        code: {
          actions: { click: 'state.name = "repeated set";\n' },
          bindings: {
            'component.options.text': 'state.listItem + ": (click me to change `name`)";\n',
          },
        },
        repeat: { collection: 'state.list' },
        id: 'builder-23e218ab8c334ca4a710e5dd02115ddd',
        meta: {
          eventActions: {
            click: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:setState',
                options: { value: 'repeated set', name: 'name' },
              },
            ],
          },
          bindingActions: {
            component: {
              options: {
                text: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:customCode',
                    options: { code: "state.listItem + ': (click me to change `name`)'" },
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
        id: 'builder-pixel-rwn1w8oltb',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=47e08601f65f4dc8b2d34f109dcce4f0',
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
    url: '/qwik-sdk-events',
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  modelId: '4e3b1c34918547c6bc82bc6908f21b47',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/qwik-sdk-events',
      operator: 'is',
    },
  ],
  published: 'published',
  firstPublished: 1683319068625,
  testRatio: 1,
  lastUpdated: 1683320209245,
  createdDate: 1683317186654,
  createdBy: 'HESl6HBVxFhHEFalzlH4zWRRdkl1',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:5173/47e08601f65f4dc8b2d34f109dcce4f0/qwik-sdk-events/?builder.space=47e08601f65f4dc8b2d34f109dcce4f0&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=bc00782838e048a9b9e8e840a4a4d0c2&builder.overrides.bc00782838e048a9b9e8e840a4a4d0c2=bc00782838e048a9b9e8e840a4a4d0c2&builder.overrides.page:/47e08601f65f4dc8b2d34f109dcce4f0/qwik-sdk-events/=bc00782838e048a9b9e8e840a4a4d0c2',
    hasLinks: false,
  },
  variations: {},
  name: 'qwik-sdk-events',
  id: 'bc00782838e048a9b9e8e840a4a4d0c2',
  rev: 'rpketkjjvpr',
};
