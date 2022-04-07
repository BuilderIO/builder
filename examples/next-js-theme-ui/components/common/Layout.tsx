/** @jsxImportSource theme-ui */
import React from 'react'
import { ThemeProvider } from 'theme-ui'
import dynamic from 'next/dynamic'
import { Head } from '@components/common'
import { useAcceptCookies } from '@lib/hooks/useAcceptCookies'
import { Button } from 'theme-ui'
import { BuilderContent, Builder } from '@builder.io/react'
import themesMap from '@config/theme'
import '@builder.io/widgets'
import 'react-spring-modal/styles.css'
import seoConfig from '@config/seo.json'
import NoSSR from './NoSSR'
import HeaderSample from './HeaderSample'

const FeatureBar = dynamic(() => import('@components/common/FeatureBar'), {
  ssr: false,
})

const Layout: React.FC<{ pageProps: any }> = ({ children, pageProps }) => {
  const builderTheme = pageProps.theme

  const isLive = !Builder.isEditing && !Builder.isPreviewing
  return (
    <BuilderContent
      isStatic
      {...(isLive && { content: builderTheme })}
      modelName="theme"
    >
      {(data, loading) => {
        if (loading && !builderTheme) {
          return 'loading ...'
        }

        const colorOverrides = data?.colorOverrides
        const siteSeoInfo = data?.siteInformation
        return (
          <>
            <Head seoInfo={siteSeoInfo || seoConfig} />
            <InnerLayout
              themeName={data?.theme || 'base'}
              colorOverrides={colorOverrides}
            >
              {children}
            </InnerLayout>
          </>
        )
      }}
    </BuilderContent>
  )
}

const InnerLayout: React.FC<{
  themeName: string
  colorOverrides?: {
    text?: string
    background?: string
    primary?: string
    secondary?: string
    muted?: string
  }
}> = ({ themeName, children, colorOverrides }) => {
  const theme = {
    ...themesMap[themeName],
    colors: {
      ...themesMap[themeName].colors,
      ...colorOverrides,
    },
  }
  const { acceptedCookies, onAcceptCookies } = useAcceptCookies()
  return (
    <ThemeProvider theme={theme}>
      <div
        sx={{
          margin: `0 auto`,
          px: 20,
          maxWidth: 1920,
          minWidth: '60vw',
          minHeight: 800,
        }}
      >
        <HeaderSample title="Sample Themed Header" />
        <main>{children}</main>
      </div>

      <NoSSR>
        <FeatureBar
          title="This site uses cookies to improve your experience. By clicking, you agree to our Privacy Policy."
          hide={Builder.isEditing ? true : acceptedCookies}
          action={
            <Button onClick={() => onAcceptCookies()}>Accept cookies</Button>
          }
        />
      </NoSSR>
    </ThemeProvider>
  )
}

export default Layout
