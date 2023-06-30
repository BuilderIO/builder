import { RenderContent } from '../../sdk-src'
import { API_KEY } from '../../builderConfig'
import { componentInfo } from '@/components/MyTextBox/component-info'
import MyTextBox from '@/components/MyTextBox/MyTextBox'

interface BuilderPageProps {
  builderContent: any
}

export default function BuilderPage({ builderContent }: BuilderPageProps) {
  return (
    <RenderContent
      apiKey={API_KEY}
      model="page"
      content={builderContent}
      customComponents={[
        {
          ...componentInfo,
          component: MyTextBox,
        },
      ]}
    />
  )
}
