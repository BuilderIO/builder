/** @jsxImportSource theme-ui */
import React from 'react'
import { ThemeProvider } from 'theme-ui'
import { BuilderContent } from '@builder.io/react'
import themesMap from '@config/theme'
import '@builder.io/widgets'
import seoConfig from '@config/seo.json'
import HeaderSample from './HeaderSample'
import Head from './Head'

const Layout: React.FC<{ pageProps: any }> = ({ children, pageProps }) => {
  const builderTheme = pageProps.theme
  return (
    <BuilderContent isStatic content={builderTheme} model="theme">
      {(data, loading) => {
        if (loading && !builderTheme) {
          return 'loading ...'
        }

        const colorOverrides = data?.colorOverrides
        const siteSeoInfo = data?.siteInformation
        const themeName = data?.theme || 'base'
        const theme = {
          ...themesMap[themeName],
          colors: {
            ...themesMap[themeName].colors,
            ...colorOverrides,
          },
        }

        return (
          <>
            <Head seoInfo={siteSeoInfo || seoConfig} />
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
            </ThemeProvider>
          </>
        )
      }}
    </BuilderContent>
  )
}

export default Layout
