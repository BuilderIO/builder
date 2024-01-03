export const REPEAT_ITEMS_BINDINGS = {
  data: {
    jsCode:
      'var __awaiter=function(e,n,t,r){return new(t||(t=Promise))((function(o,i){function a(e){try{l(r.next(e))}catch(e){i(e)}}function u(e){try{l(r.throw(e))}catch(e){i(e)}}function l(e){var n;e.done?o(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(a,u)}l((r=r.apply(e,n||[])).next())}))},__generator=function(e,n){var t,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(t)throw new TypeError("Generator is already executing.");for(;a;)try{if(t=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=n.call(e,a)}catch(e){i=[6,e],r=0}finally{t=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}};function main(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return Builder.isServer,Builder.isBrowser,[2]}))}))}var _virtual_index=main();return _virtual_index',
    inputs: [],
    themeId: false,
    tsCode:
      ' async function main () {\n  if (Builder.isServer) {\n    // Place any code here you want to only run on the server. Any  \n    // data fetched on the server will be available to re-hydrate on the client\n    // if added to the state object\n  }\n\n  if (Builder.isBrowser) {\n    // Place code that you only want to run in the browser (client side only) here\n    // For example, anything that uses document/window access or DOM manipulation\n  }\n}\n\nexport default main();',
    title: 'test-for-sami',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-ed79c46cb43848548933175fadb75344',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            actions: {
              click: 'state.testArray=[1,2,3,4,5]',
            },
            code: {
              actions: {
                click: 'state.testArray = [1, 2, 3, 4, 5];\n',
              },
            },
            id: 'builder-c1455ff055cb46e9942d702b7753645c',
            meta: {
              eventActions: {
                click: [
                  {
                    '@type': '@builder.io/core:Action',
                    action: '@builder.io:customCode',
                    options: { code: 'state.testArray = [1,2,3,4,5];' },
                  },
                ],
              },
            },
            component: {
              name: 'Core:Button',
              options: {
                text: 'Click me to state up!',
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
            marginTop: '20px',
            height: 'auto',
            paddingBottom: '30px',
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        repeat: { collection: 'state.testArray' },
        id: 'builder-54bb43b063be43c997cdc7b6e787476f',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            bindings: {
              'component.options.text':
                'var _virtual_index=state.testArray[state.$index];return _virtual_index',
            },
            code: {
              bindings: {
                'component.options.text': 'state.testArray[state.$index]',
              },
            },
            id: 'builder-0c5d599a214e45eeb0a08ae41705e7d7',
            component: {
              name: 'Text',
              options: { text: 'Enter some text...' },
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
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
      },
    ],
  },
};
