import type { AppProps } from 'next/app'

import { builder } from '@builder.io/react'
import builderConfig from '@config/builder'
builder.init(builderConfig.apiKey)

import '@components/CustomRichText/CustomRichText.builder'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
