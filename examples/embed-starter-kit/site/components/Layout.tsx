import { Header } from './Header'
import { BuilderContent } from '@builder.io/react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { themes } from '../helpers/themes'
import Box from '@mui/material/Box'
import { generatePalette } from 'helpers/generate-palette'

/**
 * Global layout
 */
export function Layout(props: { theme: any; header: any; children: any }) {
  return (
    <BuilderContent content={props.theme} model="theme">
      {(data, loading) => {
        if (loading && !props.theme) {
          return 'loading...'
        }
        const palette = generatePalette(data?.colors)
        const themeName = data?.theme
        const baseTheme = themes[themeName] || themes.base
        const theme = createTheme(
          baseTheme,
          palette
            ? {
                palette,
              }
            : {}
        )
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header header={props.header} />
            <Box
              sx={{
                margin: `0 auto`,
                maxWidth: 1920,
                minWidth: '60vw',
                minHeight: 800,
              }}
            >
              <main>{props.children}</main>
            </Box>
          </ThemeProvider>
        )
      }}
    </BuilderContent>
  )
}
