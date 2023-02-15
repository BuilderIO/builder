export const CONTENT = {
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  createdDate: 1647464399394,
  data: {
    themeId: false,
    title: 'symbol-data-bindings',
    state: {
      borderRadiusTopLeft: '10px',
      borderRadiusTopRight: '22px',
      borderRadiusBottomLeft: '40px',
      borderRadiusBottomRight: '30px',
    },
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        component: {
          name: 'Text',
          options: {
            text: 'Enter some text...',
          },
        },
        bindings: {
          'style.borderTopLeftRadius':
            'var _virtual_index=state.borderRadiusTopLeft;return _virtual_index',
          'style.borderTopRightRadius':
            'var _virtual_index=state.borderRadiusTopRight;return _virtual_index',
          'style.borderBottomLeftRadius':
            'var _virtual_index=state.borderRadiusBottomLeft;return _virtual_index',
          'style.borderBottomRightRadius':
            'var _virtual_index=state.borderRadiusBottomRight;return _virtual_index',
          title: 'var _virtual_index="some special title";return _virtual_index',
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
      "/*\n  * Global objects available:\n  *\n  * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n  * context - builder context object - learn about state https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n  * fetch - Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'\n  * Builder - Builder object - useful values include: Builder.isServer, Builder.isBrowser, Builder.isPreviewing, Builder.isEditing\n  *\n  * visit https://www.builder.io/c/docs/guides/custom-code\n  * for more information on writing custom code\n  */\n async function main () {\n  if (Builder.isServer) {\n    // Place any code here you want to only run on the server. Any  \n    // data fetched on the server will be available to re-hydrate on the client\n    // if added to the state object\n  }\n\n  if (Builder.isBrowser) {\n    // Place code that you only want to run in the browser (client side only) here\n    // For example, anything that uses document/window access or DOM manipulation\n  }\n}\n\nexport default main();",
    jsCode:
      'var __awaiter=function(e,n,t,r){return new(t||(t=Promise))((function(o,i){function a(e){try{l(r.next(e))}catch(e){i(e)}}function u(e){try{l(r.throw(e))}catch(e){i(e)}}function l(e){var n;e.done?o(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(a,u)}l((r=r.apply(e,n||[])).next())}))},__generator=function(e,n){var t,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(t)throw new TypeError("Generator is already executing.");for(;a;)try{if(t=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=n.call(e,a)}catch(e){i=[6,e],r=0}finally{t=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return Builder.isServer,Builder.isBrowser,[2]}))}))}var _virtual_index=main();return _virtual_index',
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
