'use client'
import * as React from 'react'
import { useContext, useState } from 'react'

interface Props {
  cssCode?: string
  customFonts?: CustomFont[]
  contentId?: string
}

import RenderInlinedStyles from '../../render-inlined-styles'
import type { CustomFont } from './render-styles.helpers'
import { getCss } from './render-styles.helpers'
import { getFontCss } from './render-styles.helpers'
import builderContext from '@/sdk-src/context/builder.context'

function RenderContentStyles() {
  const context = useContext(builderContext)
  const contentId = context.content?.id
  const cssCode = context.content?.data?.cssCode
  const customFonts = context.content?.data?.customFonts

  const [injectedStyles, setInjectedStyles] = useState(() =>
    `
${getCss({
  cssCode: cssCode,
  contentId: contentId,
})}
${getFontCss({
  customFonts: customFonts,
})}

.builder-text > p:first-of-type, .builder-text > .builder-paragraph:first-of-type {
  margin: 0;
}
.builder-text > p, .builder-text > .builder-paragraph {
  color: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  font-weight: inherit;
  font-size: inherit;
  text-align: inherit;
  font-family: inherit;
}
`.trim()
  )

  return <RenderInlinedStyles styles={injectedStyles} />
}

export default RenderContentStyles
