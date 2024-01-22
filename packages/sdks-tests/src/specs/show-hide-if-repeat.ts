export const SHOW_HIDE_IF_REPEATS = {
  data: {
    inputs: [],
    jsCode:
      'var __awaiter=function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{l(r.next(e))}catch(e){i(e)}}function u(e){try{l(r.throw(e))}catch(e){i(e)}}function l(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,u)}l((r=r.apply(e,t||[])).next())}))},__generator=function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return Builder.isServer,Builder.isBrowser,[2]}))}))}state.items=["zero","one","two","three"];var _virtual_index=main();return _virtual_index',
    httpRequests: {},
    themeId: false,
    tsCode:
      '/*\n  * Global objects available:\n  *\n  * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n  * context - builder context object - learn about state https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n  * fetch - Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API\'\n  * Builder - Builder object - useful values include: Builder.isServer, Builder.isBrowser, Builder.isPreviewing, Builder.isEditing\n  *\n  * visit https://www.builder.io/c/docs/guides/custom-code\n  * for more information on writing custom code\n  */\n\nstate.items = ["zero", "one","two", "three"];\n\n async function main () {\n  if (Builder.isServer) {\n    // Place any code here you want to only run on the server. Any  \n    // data fetched on the server will be available to re-hydrate on the client\n    // if added to the state object\n  }\n\n  if (Builder.isBrowser) {\n    // Place code that you only want to run in the browser (client side only) here\n    // For example, anything that uses document/window access or DOM manipulation\n  }\n}\n\nexport default main();',
    cssCode:
      "/*\n* Custom CSS styles\n*\n* Global by default, but use `&` to scope to just this content, e.g.\n*\n*   & .foo {\n*     color: 'red'\n*   }\n*/\n",
    title: 'data-binding-testing',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-68bf0cbd148f4efbbe9aec74dd2c6c06',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            actions: { mouseEnter: 'state.btnHovered="1"' },
            code: {
              actions: {
                mouseEnter:
                  '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\n\nstate.btnHovered = "1";\n',
              },
            },
            layerName: 'button1',
            id: 'builder-169c8edd283a472db00de6762d9b6945',
            meta: {
              previousId: 'builder-49f06c0dd89d458e80c3eb3cd13f4802',
              eventActions: {
                mouseEnter: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:customCode',
                    options: {
                      code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\n\nstate.btnHovered = "1"',
                    },
                  },
                ],
              },
            },
            component: {
              name: 'Core:Button',
              options: { text: 'button1', openLinkInNewTab: false },
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
            actions: { mouseEnter: 'state.btnHovered="2"' },
            code: {
              actions: {
                mouseEnter:
                  '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.btnHovered = "2";\n',
              },
            },
            id: 'builder-a6c76f93728d475892da4cfa154658d5',
            meta: {
              previousId: 'builder-0489988e43404569b17185dbd9bae278',
              eventActions: {
                mouseEnter: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:customCode',
                    options: {
                      code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.btnHovered = "2"',
                    },
                  },
                ],
              },
            },
            component: {
              name: 'Core:Button',
              options: { text: 'button2', openLinkInNewTab: false },
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
            actions: { mouseEnter: 'state.btnHovered="3"' },
            code: {
              actions: {
                mouseEnter:
                  '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.btnHovered = "3";\n',
              },
            },
            id: 'builder-6047135a5c754bd491fa0b1507329869',
            meta: {
              previousId: 'builder-0ace40b086da49d1976ab648fd20bca0',
              eventActions: {
                mouseEnter: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:customCode',
                    options: {
                      code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.btnHovered = "3"',
                    },
                  },
                ],
              },
            },
            component: {
              name: 'Core:Button',
              options: { text: 'button3', openLinkInNewTab: false },
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
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            paddingBottom: '30px',
            display: 'flex',
            flexDirection: 'row',
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        actions: { mouseEnter: 'console.log(state.$index)' },
        code: {
          actions: {
            mouseEnter:
              '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nconsole.log(state.$index);\n',
          },
        },
        repeat: { collection: 'state?.items' },
        layerName: 'Box',
        id: 'builder-4eeec7c71f3f4b8e9eb4a98132bc3af0',
        meta: {
          eventActions: {
            mouseEnter: [
              {
                '@type': '@builder.io/core:Action',
                action: '@builder.io:customCode',
                options: {
                  code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nconsole.log(state.$index)',
                },
              },
            ],
          },
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            bindings: {
              'component.options.text': 'state.items[state.$index]',
              show: 'var _virtual_index=state.btnHovered==state.$index;return _virtual_index',
              hide: 'var _virtual_index="1"==state.btnHovered;return _virtual_index',
            },
            code: {
              bindings: {
                'component.options.text':
                  '/**\n * Global objects available in state bindings:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n *\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\n\nstate.items[state.$index]',
                show: 'state.btnHovered == state.$index',
                hide: 'state.btnHovered == "1"',
              },
            },
            layerName: 'Enter some text......',
            id: 'builder-e182628e3ab748e0aeec3762a47f7453',
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
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            height: '200px',
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
      },
    ],
  },
};
