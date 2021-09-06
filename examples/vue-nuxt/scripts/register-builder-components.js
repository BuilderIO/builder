import { registerComponent } from '@builder.io/sdk-vue'
import HelloWorldComponent from '../components/hello-world'

registerComponent(HelloWorldComponent, {
  name: 'Hello World',
  inputs: [
    {
      name: 'text',
      type: 'string',
      defaultValue: 'World',
    },
  ],
})
