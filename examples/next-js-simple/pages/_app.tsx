import type { AppProps } from 'next/app'

import { builder } from '@builder.io/react'
import builderConfig from '@config/builder'
builder.init('e331e76e501d4e75b90664fad3b86b17');
// builder.init('fb99890e035245938d554a1286ea46da', false)

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
