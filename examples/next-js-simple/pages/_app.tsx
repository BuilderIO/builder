import type { AppProps } from 'next/app'

import { builder } from '@builder.io/react'
import builderConfig from '@config/builder'
// builder.init('e331e76e501d4e75b90664fad3b86b17');
builder.init('271bdcf584e24ca896dede7a91dfb1cb')

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
