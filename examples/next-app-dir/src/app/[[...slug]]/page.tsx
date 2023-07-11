import { API_KEY } from '../../builderConfig'
import CatFacts from '@/components/MyTextBox/CatFacts'
import MyTextBox from '@/components/MyTextBox/MyTextBox'
import { componentInfo } from '@/components/MyTextBox/component-info'
import { RenderContent, getContent } from '@builder.io/sdk-react/next'

interface MyPageProps {
  params: {
    slug: string[]
  }
  searchParams: Record<string, string>
}

// Pages are Server Components by default
export default async function Page(props: MyPageProps) {
  const content = await getContent(props)

  if (!content) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    )
  }

  return (
    <RenderContent
      apiKey={API_KEY}
      model="page"
      content={content}
      customComponents={[
        {
          ...componentInfo,
          component: MyTextBox,
        },
        {
          name: 'CatFacts',
          component: CatFacts,
          inputs: [
            {
              name: 'text',
              type: 'text',
              defaultValue: 'default text',
            },
          ],
        },
      ]}
    />
  )
}
export const revalidate = 4
