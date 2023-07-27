import type { AppProps } from 'next/app'

import { builder } from '@builder.io/react'

builder.init('271bdcf584e24ca896dede7a91dfb1cb')

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
