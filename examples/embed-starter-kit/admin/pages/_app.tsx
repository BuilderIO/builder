import type { AppProps } from 'next/app'
import Header from 'components/Header'
import { CssBaseline, ThemeProvider, createTheme } from '@material-ui/core'
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: 'rgb(220, 0, 78)',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
  },
})
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header></Header>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
