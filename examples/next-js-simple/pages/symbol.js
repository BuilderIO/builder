import { BuilderComponent, builder } from '@builder.io/react';
import builderConfig from '@config/builder';
import '@builder.io/widgets/dist/lib/builder-widgets-async'

export default function Page() {

  return <BuilderComponent model="symbol" options={{enrich: true}} />
}