import { BuilderComponent, builder } from '@builder.io/react';
import builderConfig from '@config/builder';
import '@builder.io/widgets/dist/lib/builder-widgets-async'

// Replace with your Public API Key.
builder.init(builderConfig.apiKey)

export default function Page() {
    console.log('HELLO')
  return <BuilderComponent model="symbol" options={{includeRefs: true}} />
}