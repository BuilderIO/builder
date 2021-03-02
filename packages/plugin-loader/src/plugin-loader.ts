'use strict';
import './polyfills';
import * as reactDom from 'react-dom';
import * as React from 'react';
// import * as builderReact from '@builder.io/react'
import * as emotionCore from '@emotion/core';
import * as emotionStyled from '@emotion/styled';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as mst from '@builder.io/mobx-state-tree';
import * as mui from '@material-ui/core';
import * as muiIcons from '@material-ui/icons';
import * as builder from '@builder.io/sdk';

const context = {
  user: {
    organization: {
      value: {
        settings: {
          plugins: {
            get() {},
            set() {},
          },
        },
      },
    },
  },
};

import 'systemjs/dist/system.js';
import 'systemjs/dist/extras/named-register.js';

// Ugh, webpack...
export const system: typeof System = eval('System');

const exposePackages = {
  react: React,
  'react-dom': reactDom,
  '@builder.io/sdk': builder,
  // '@builder.io/react': builderReact,
  '@emotion/core': emotionCore,
  '@emotion/styled': emotionStyled,
  mobx: mobx,
  'mobx-state-tree': mst,
  'mobx-react': mobxReact,
  '@material-ui/core': mui,
  '@material-ui/icons': muiIcons,
};

Object.keys(exposePackages).forEach(packageName => {
  system.register(packageName, [], _export => {
    return {
      execute: () => {
        const content = (exposePackages as any)[packageName];
        _export({
          ...content,
          default: content,
        });
      },
    };
  });
});

if (typeof self !== 'undefined') {
  self.addEventListener('message', event => {
    const data = event.data;
    if (data && data.type === 'builder.loadPlugin') {
      console.log('loadPluginMessage', event.data);

      const plugin = '@builder.io/plugin-cloudinary';
      const pluginUrl = plugin.startsWith('http') ? plugin : 'https://unpkg.com/' + plugin;
      system
        .import(pluginUrl)
        .then((output: any) => {
          // TODO: read the exported component
          const editor = builder.Builder.editors[0];
          if (editor && editor.component) {
            // TODO: bind value, onchange, context
            reactDom.render(React.createElement(editor.component), document.body);
          } else if (output.default) {
            reactDom.render(React.createElement(output.default), document.body);
          }
        })
        .catch(console.error);
    }
  });
  self.postMessage({ type: 'builder.workerLoaded' }, '*');
}

// reactDom.render(React.createElement('div', {}, 'hello there'), document.body)

setTimeout(() => {
  const plugin = '@builder.io/plugin-cloudinary';
  const pluginUrl = plugin.startsWith('http') ? plugin : 'https://unpkg.com/' + plugin;
  system
    // TODO: why is systemjs loading/returning React as output here??
    .import(pluginUrl)
    .then((output: any) => {
      setTimeout(() => {
        const editor = builder.Builder.editors[0];
        if (editor && editor.component) {
          // TODO: bind value, onchange, context
          reactDom.render(
            React.createElement(editor.component, { context, style: { background: 'red' } }),
            document.body
          );
        } else if (output.default) {
          reactDom.render(React.createElement(output.default, { context }), document.body);
        }
      });
    })
    .catch(console.error);
}, 100);
