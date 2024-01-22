export const JS_CONTENT_IS_BROWSER = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1705670644112,
  id: 'e9f017bb5a54485a95037344afe1fb46',
  '@version': 4,
  name: 'getdate',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'published',
  meta: {
    hasLinks: false,
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:5173/getdate?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=e9f017bb5a54485a95037344afe1fb46&builder.overrides.e9f017bb5a54485a95037344afe1fb46=e9f017bb5a54485a95037344afe1fb46&builder.overrides.page:/getdate=e9f017bb5a54485a95037344afe1fb46',
  },
  priority: -88,
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/getdate',
    },
  ],
  data: {
    jsCode:
      'var __awaiter=function(e,n,t,r){return new(t||(t=Promise))((function(a,o){function i(e){try{l(r.next(e))}catch(e){o(e)}}function u(e){try{l(r.throw(e))}catch(e){o(e)}}function l(e){var n;e.done?a(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(i,u)}l((r=r.apply(e,n||[])).next())}))},__generator=function(e,n){var t,r,a,o,i={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function u(o){return function(u){return function(o){if(t)throw new TypeError("Generator is already executing.");for(;i;)try{if(t=1,r&&(a=2&o[0]?r.return:o[0]?r.throw||((a=r.return)&&a.call(r),0):r.next)&&!(a=a.call(r,o[1])).done)return a;switch(r=0,a&&(o=[2&o[0],a.value]),o[0]){case 0:case 1:a=o;break;case 4:return i.label++,{value:o[1],done:!1};case 5:i.label++,r=o[1],o=[0];continue;case 7:o=i.ops.pop(),i.trys.pop();continue;default:if(!(a=(a=i.trys).length>0&&a[a.length-1])&&(6===o[0]||2===o[0])){i=0;continue}if(3===o[0]&&(!a||o[1]>a[0]&&o[1]<a[3])){i.label=o[1];break}if(6===o[0]&&i.label<a[1]){i.label=a[1],a=o;break}if(a&&i.label<a[2]){i.label=a[2],i.ops.push(o);break}a[2]&&i.ops.pop(),i.trys.pop();continue}o=n.call(e,i)}catch(e){o=[6,e],r=0}finally{t=a=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return Builder.isServer,Builder.isBrowser&&(state.year=(new Date).getFullYear()),[2]}))}))}var _virtual_index=main();return _virtual_index',
    inputs: [],
    tsCode:
      "/*\n  * Global objects available:\n  *\n  * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n  * context - builder context object - learn about state https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n  * fetch - Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'\n  * Builder - Builder object - useful values include: Builder.isServer, Builder.isBrowser, Builder.isPreviewing, Builder.isEditing\n  *\n  * visit https://www.builder.io/c/docs/guides/custom-code\n  * for more information on writing custom code\n  */\n async function main () {\n  if (Builder.isServer) {\n    // Place any code here you want to only run on the server. Any  \n    // data fetched on the server will be available to re-hydrate on the client\n    // if added to the state object\n  }\n\n  if (Builder.isBrowser) {\n    // Place code that you only want to run in the browser (client side only) here\n    // For example, anything that uses document/window access or DOM manipulation\n    state.year = new Date().getFullYear()\n  }\n}\n\nexport default main();\n",
    themeId: false,
    title: 'getdate',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: {
          'component.options.text': 'var _virtual_index=state.year;return _virtual_index',
        },
        code: {
          bindings: {
            'component.options.text': 'state.year',
          },
        },
        id: 'builder-20536be45acc4cd9921a836b12ab53c1',
        component: {
          name: 'Text',
          options: {
            text: 'Enter some text...',
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
  lastUpdated: 1705679243443,
  firstPublished: 1705670768358,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};
