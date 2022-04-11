import { registerComponent } from '@builder.io/sdk-vue';

// Import the Builder blocks you want
// TODO: find a way to do this automatically
import '@builder.io/sdk-vue/nuxt2/src/blocks/image.vue';
import '@builder.io/sdk-vue/nuxt2/src/blocks/text.vue';
import '@builder.io/sdk-vue/nuxt2/src/blocks/columns.vue';
import '@builder.io/sdk-vue/nuxt2/src/blocks/button.vue';
import '@builder.io/sdk-vue/nuxt2/src/blocks/section.vue';

// Register Vue Storefront UI components

// Atoms
import { SfButton } from '@storefront-ui/vue';
registerComponent(SfButton, {
  name: 'SfButton',
  canHaveChildren: true,
  inputs: [
    {
      name: 'link',
      type: 'string',
      defaultValue: null,
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'type',
      type: 'string',
      enum: ['button', 'submit', 'reset'],
      defaultValue: 'button',
    },
  ],
});

// Molecules (multiple slots)
import { SfCard } from '@storefront-ui/vue';
registerComponent(SfCard, {
  name: 'SfCard',
  canHaveChildren: true,
  inputs: [
    { name: 'image', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'titleLevel', type: 'number' },
    { name: 'description', type: 'string' },
    { name: 'link', type: 'string' },
    { name: 'buttonText', type: 'string' },
  ],
});

// Organisms (other UI molecules/atoms as custom children)
import { SfTabs } from '@storefront-ui/vue';

// TO-DO: can you restrict the type of children it receives, to just the `SfTab` component?
registerComponent(SfTabs, {
  name: 'SfTabs',
  canHaveChildren: true,
  inputs: [
    {
      name: 'openTab',
      type: 'number',
    },
    {
      name: 'tabMaxContentHeight',
      type: 'string',
    },
    {
      name: 'tabShowText',
      type: 'string',
    },
    {
      name: 'tabHideText',
      type: 'string',
    },
  ],
});

import SfTab from '../components/Builder/CustomSfTab.vue';
registerComponent(SfTab, {
  name: 'SfTab',
  canHaveChildren: true,
  // needed to get correct DOM hierarchy with `SfTabs`
  noWrap: true,
  inputs: [
    {
      name: 'title',
      type: 'string',
      default: '',
    },
  ],
});

// Register your Builder components
import HelloWorldComponent from '../components/Builder/HelloWorld.vue';

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
