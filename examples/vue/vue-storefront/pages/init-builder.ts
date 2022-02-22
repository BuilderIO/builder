import { registerComponent } from '@builder.io/sdk-vue';

// Import the Builder blocks you want
// TODO: find a way to do this automatically
import '@builder.io/sdk-vue/nuxt2/src/blocks/image.vue';
import '@builder.io/sdk-vue/nuxt2/src/blocks/text.vue';
import '@builder.io/sdk-vue/nuxt2/src/blocks/columns.vue';
import '@builder.io/sdk-vue/nuxt2/src/blocks/button.vue';
import '@builder.io/sdk-vue/nuxt2/src/blocks/section.vue';

// Register your Builder components
import HelloWorldComponent from '../components/HelloWorld.vue';

registerComponent(HelloWorldComponent, {
  name: 'Hello World',
  canHaveChildren: true,
  inputs: [
    {
      name: 'text',
      type: 'string',
      defaultValue: 'World',
    },
  ],
});
