import '@assets/main.css'
import 'keen-slider/keen-slider.min.css'
import type { AppProps } from 'next/app'
import { builder, Builder } from '@builder.io/react'
import builderConfig from '@config/builder'
builder.init(builderConfig.apiKey)
import '../blocks/CloudinaryImage/CloudinaryImage.builder'
import { Layout } from '@components/common'

Builder.register('insertMenu', {
  name: 'Cloudinary Components',
  items: [{ name: 'CloudinaryImage' }],
})

export default function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
      <Layout pageProps={pageProps}>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
