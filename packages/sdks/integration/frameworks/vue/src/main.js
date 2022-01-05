import { createApp } from 'vue';
import App from './App.vue';

import { registerComponent } from '@builder.io/sdk-vue';

import HelloWorld from './components/HelloWorld';

registerComponent(HelloWorld, {
  name: 'HelloWorld',
  inputs: [{ name: 'msg', type: 'string' }],
});

createApp(App).mount('#app');
