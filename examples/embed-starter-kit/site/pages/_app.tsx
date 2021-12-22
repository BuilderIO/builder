import type { AppProps } from 'next/app'
import { Layout } from '../components/Layout'
import { CacheProvider, EmotionCache } from '@emotion/react'

import { createEmotionCache } from '../helpers/create-emotion-cache'

const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export default function MyApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: MyAppProps) {
  return (
    <CacheProvider value={emotionCache!}>
      <Layout {...pageProps}>
        <Component {...pageProps} />
      </Layout>
    </CacheProvider>
  )
}
