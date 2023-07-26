import type { AppProps } from 'next/app'

import { builder } from '@builder.io/react'
import builderConfig from '@config/builder'
// builder.init('271bdcf584e24ca896dede7a91dfb1cb', false);
builder.init('fb99890e035245938d554a1286ea46da', false)

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
