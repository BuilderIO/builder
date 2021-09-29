import { FC } from 'react'
import 'normalize.css'
import '@assets/main.css'
import type { AppProps } from 'next/app'

import { builder } from '@builder.io/react'
import builderConfig from '@config/builder'
builder.init(builderConfig.apiKey)


const Noop: FC = ({ children }) => <>{children}</>

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop

  return (
    <>
      <Layout pageProps={pageProps}>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
