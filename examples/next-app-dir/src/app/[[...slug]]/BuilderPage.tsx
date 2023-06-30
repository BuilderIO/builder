'use client'

import { RenderContent } from '../../sdk-src'
import { API_KEY } from '../../builderConfig'

interface BuilderPageProps {
  builderContent: any
}

export default function BuilderPage({ builderContent }: BuilderPageProps) {
  return (
    <RenderContent apiKey={API_KEY} model="page" content={builderContent} />
  )
}
