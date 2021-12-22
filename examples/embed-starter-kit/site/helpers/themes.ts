import { ThemeOptions } from '@mui/material'

export const themes: Record<string, ThemeOptions> = {
  comic: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#bd0707',
      },
      secondary: {
        main: '#ffc510',
      },
      background: {
        default: '#4c69f6',
        paper: '#4c94f6',
      },
    },
  },
  base: {
    palette: {
      mode: 'light',
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
  },
  darkBlue: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#5893df',
      },
      secondary: {
        main: '#2ec5d3',
      },
      background: {
        default: '#192231',
        paper: '#24344d',
      },
    },
  },
  darkRed: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#ff8f00',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: '#310000',
        paper: '#731010',
      },
    },
    shape: {
      borderRadius: 16,
    },
  },
}
