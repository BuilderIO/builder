export const SSR_BINDING_CONTENT = {
  ownerId: '5271c255f7824802a30f12bdad90e347',
  lastUpdateBy: null,
  createdDate: 1726812648136,
  id: '5e900ec5f55244f3bcc35af6b49eeee5',
  '@version': 4,
  name: 'SSR style bindings',
  modelId: '12518e35051e42dda999e91f1162f0bd',
  published: 'published',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:3000/ssr-style-bindings?builder.space=5271c255f7824802a30f12bdad90e347&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=5e900ec5f55244f3bcc35af6b49eeee5&builder.overrides.5e900ec5f55244f3bcc35af6b49eeee5=5e900ec5f55244f3bcc35af6b49eeee5&builder.overrides.page:/ssr-style-bindings=5e900ec5f55244f3bcc35af6b49eeee5&builder.options.locale=Default',
    hasLinks: false,
  },
  priority: -42,
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/ssr-style-bindings',
    },
  ],
  data: {
    themeId: false,
    title: 'SSR style bindings',
    inputs: [],
    tsCode:
      "/*\n  * Global objects available:\n  *\n  * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n  * context - builder context object - learn about state https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n  * fetch - Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'\n  * Builder - Builder object - useful values include: Builder.isServer, Builder.isBrowser, Builder.isPreviewing, Builder.isEditing\n  *\n  * visit https://www.builder.io/c/docs/guides/custom-code\n  * for more information on writing custom code\n  */\nstate.color ='red'\n async function main () {\n  if (Builder.isServer) {\n    // Place any code here you want to only run on the server. Any  \n    // data fetched on the server will be available to re-hydrate on the client\n    // if added to the state object\n  }\n\n  if (Builder.isBrowser) {\n    // Place code that you only want to run in the browser (client side only) here\n    // For example, anything that uses document/window access or DOM manipulation\n  }\n}\n\nexport default main();",
    jsCode:
      'var __awaiter=function(e,n,t,r){return new(t||(t=Promise))((function(o,i){function a(e){try{l(r.next(e))}catch(e){i(e)}}function u(e){try{l(r.throw(e))}catch(e){i(e)}}function l(e){var n;e.done?o(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(a,u)}l((r=r.apply(e,n||[])).next())}))},__generator=function(e,n){var t,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(t)throw new TypeError("Generator is already executing.");for(;a;)try{if(t=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=n.call(e,a)}catch(e){i=[6,e],r=0}finally{t=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return Builder.isServer,Builder.isBrowser,[2]}))}))}state.color="red";var _virtual_index=main();return _virtual_index',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-f8dccc01914a46999b274b922d77e352',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            bindings: {
              'style.backgroundColor': 'state.color',
            },
            code: {
              bindings: {
                'style.backgroundColor':
                  '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.color;\n',
              },
            },
            id: 'builder-b166aa9350cb4f00852666910ff06991',
            meta: {
              bindingActions: {
                style: {
                  backgroundColor: [
                    {
                      '@type': '@builder.io/core:Action',
                      action: '@builder.io:customCode',
                      options: {
                        code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.color',
                      },
                    },
                  ],
                },
              },
            },
            component: {
              name: 'Text',
              options: {
                text: 'My Awesome text',
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
                paddingTop: '20px',
              },
            },
          },
        ],
      },
    ],
  },
  metrics: {
    clicks: 0,
    impressions: 0,
  },
  variations: {},
  lastUpdated: 1726827384814,
  firstPublished: 1726827326819,
  testRatio: 1,
  createdBy: 'vkEwLBAcR1VHNUy7DDD366ffYjQ2',
  lastUpdatedBy: 'vkEwLBAcR1VHNUy7DDD366ffYjQ2',
  folders: [],
};
