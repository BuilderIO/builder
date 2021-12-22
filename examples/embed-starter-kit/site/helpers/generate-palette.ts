import { PaletteOptions } from '@mui/material/styles'

const fastClone = <T>(obj: any): T => JSON.parse(JSON.stringify(obj))

export function generatePalette(themeColors?: {
  primary: string
  secondary: string
  background: string
}): PaletteOptions | void {
  if (themeColors) {
    return fastClone<PaletteOptions>({
      primary: {
        main: themeColors.primary || undefined,
      },
      secondary: {
        main: themeColors.secondary || undefined,
      },
      background: {
        default: themeColors.background || undefined,
      },
    })
  }
}
