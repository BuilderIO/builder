export const CONTENT = {
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  createdDate: 1647464399394,
  data: {
    themeId: false,
    title: 'symbol-data-bindings',
    state: {
      borderRadiusTopLeft: '20px',
      borderRadiusTopRight: '22px',
      borderRadiusBottomLeft: '20px',
      borderRadiusBottomRight: '12px',
    },
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          'style.borderTopLeftRadius':
            'var _virtual_index=state.borderRadiusTopLeft;return _virtual_index',
          'style.borderTopRightRadius':
            'var _virtual_index=state.borderRadiusTopRight;return _virtual_index',
          'style.borderBottomLeftRadius':
            'var _virtual_index=state.borderRadiusBottomLeft;return _virtual_index',
          'style.borderBottomRightRadius':
            'var _virtual_index=state.borderRadiusBottomRight;return _virtual_index',
          title:
            'var _virtual_index="some special title";return _virtual_index',
          height: 'var _virtual_index=30;return _virtual_index',
        },
        code: {
          bindings: {
            'style.borderTopLeftRadius': 'state.borderRadiusTopLeft',
            'style.borderTopRightRadius': 'state.borderRadiusTopRight',
            'style.borderBottomLeftRadius': 'state.borderRadiusBottomLeft',
            'style.borderBottomRightRadius': 'state.borderRadiusBottomRight',
            title: '"some special title"',
            height: '30',
          },
        },
        id: 'builder-1098ca09970149b3bc4cd43643bd0545',
        meta: { previousId: 'builder-09c6859ec12241b99153a8383954fcfd' },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            height: '200px',
            backgroundColor: 'rgba(89, 43, 43, 1)',
          },
        },
      },
    ],
    inputs: [],
    tsCode:
      "/*\n  * Global objects available:\n  *\n  * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n  * context - builder context object - learn about state https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n  * fetch - Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'\n  * Builder - Builder object - useful values include: Builder.isServer, Builder.isBrowser, Builder.isPreviewing, Builder.isEditing\n  *\n  * visit https://www.builder.io/c/docs/guides/custom-code\n  * for more information on writing custom code\n  */\n async function main () {\n      state.borderRadiusTopLeft = '20px'\n      state.borderRadiusTopRight = '22px'\n      state.borderRadiusBottomLeft = '20px'\n      state.borderRadiusBottomRight = '20px'\n\n  if (Builder.isServer) {\n    // Place any code here you want to only run on the server. Any  \n    // data fetched on the server will be available to re-hydrate on the client\n    // if added to the state object\n  }\n\n  if (Builder.isBrowser) {\n    // Place code that you only want to run in the browser (client side only) here\n    // For example, anything that uses document/window access or DOM manipulation\n  }\n}\n\nexport default main();",
    jsCode:
      'var __awaiter=function(t,e,r,n){return new(r||(r=Promise))((function(o,a){function i(t){try{l(n.next(t))}catch(t){a(t)}}function u(t){try{l(n.throw(t))}catch(t){a(t)}}function l(t){var e;t.done?o(t.value):(e=t.value,e instanceof r?e:new r((function(t){t(e)}))).then(i,u)}l((n=n.apply(t,e||[])).next())}))},__generator=function(t,e){var r,n,o,a,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function u(a){return function(u){return function(a){if(r)throw new TypeError("Generator is already executing.");for(;i;)try{if(r=1,n&&(o=2&a[0]?n.return:a[0]?n.throw||((o=n.return)&&o.call(n),0):n.next)&&!(o=o.call(n,a[1])).done)return o;switch(n=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return i.label++,{value:a[1],done:!1};case 5:i.label++,n=a[1],a=[0];continue;case 7:a=i.ops.pop(),i.trys.pop();continue;default:if(!(o=(o=i.trys).length>0&&o[o.length-1])&&(6===a[0]||2===a[0])){i=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){i.label=a[1];break}if(6===a[0]&&i.label<o[1]){i.label=o[1],o=a;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(a);break}o[2]&&i.ops.pop(),i.trys.pop();continue}a=e.call(t,i)}catch(t){a=[6,t],n=0}finally{r=o=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(t){return state.borderRadiusTopLeft="20px",state.borderRadiusTopRight="22px",state.borderRadiusBottomLeft="20px",state.borderRadiusBottomRight="20px",Builder.isServer,Builder.isBrowser,[2]}))}))}var _virtual_index=main();return _virtual_index',
  },
  id: '2a23baae19a64031b8dd17e8fd8adc47',
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  meta: {
    hasLinks: false,
    kind: 'page',
    lastPreviewUrl:
      'https://preview.builder.codes?model=page&previewing=truehttp://localhost:3000/symbols&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=2a23baae19a64031b8dd17e8fd8adc47&builder.overrides.2a23baae19a64031b8dd17e8fd8adc47=2a23baae19a64031b8dd17e8fd8adc47&builder.overrides.page:/=2a23baae19a64031b8dd17e8fd8adc47',
    needsHydration: true,
  },
  modelId: '240a12053d674735ac2a384dcdc561b5',
  name: 'Symbols',
  published: 'published',
  query: [
    {
      '@type': '@builder.io/core:Query',
      operator: 'is',
      property: 'urlPath',
      value: '/symbols',
    },
  ],
  testRatio: 1,
  variations: {},
  lastUpdated: 1660661567598,
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fb4c208dab77d489386f78e8cf43f5feb',
  firstPublished: 1649431689632,
  rev: 'q440q0er5p',
};
