import { builder } from '@builder.io/react'
import builderConfig from '@config/builder'
builder.init(builderConfig.apiKey)

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
