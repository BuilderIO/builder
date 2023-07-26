import { BuilderComponent, builder } from '@builder.io/react';
import builderConfig from '@config/builder';
import '@builder.io/widgets/dist/lib/builder-widgets-async'

// Replace with your Public API Key.
// builder.init('271bdcf584e24ca896dede7a91dfb1cb')

export default function Page() {

  return <BuilderComponent model="symbol" options={{includeRefs: true}} />
}