import { registerComponent } from '@builder.io/sdk-vue';

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
