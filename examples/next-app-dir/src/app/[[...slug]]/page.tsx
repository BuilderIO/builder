import { getContent } from '../../sdk-src/functions/get-content'
import BuilderPage from './BuilderPage'
import { API_KEY } from '../../builderConfig'
import { getBuilderSearchParams } from '@/sdk-src'
import { applyPatchWithMinimalMutationChain } from '@/sdk-src/helpers/apply-patch-with-mutation'

async function getBuilderContent(props: MyPageProps) {
  const urlPath = '/' + (props.params?.slug?.join('/') || '')

  const content = await getContent({
    model: 'page',
    apiKey: API_KEY,
    userAttributes: { urlPath },
    options: getBuilderSearchParams(props.searchParams),
  })

  const builderPatch = props.searchParams['builder.patch']
  if (content && builderPatch) {
    const patches = JSON.parse(builderPatch)
    console.log('received patches', patches)
    return applyPatchWithMinimalMutationChain(content, patches, false)
  }

  return content
}

interface MyPageProps {
  params: {
    slug: string[]
  }
  searchParams: Record<string, string>
}

// Pages are Server Components by default
export default async function Page(props: MyPageProps) {
  const content = await getBuilderContent(props)

  if (!content) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    )
  }

  console.log(
    'new content in Page:',
    content?.data?.blocks?.[0].component?.options.text
  )

  return <BuilderPage builderContent={content} />
}
export const revalidate = 4
