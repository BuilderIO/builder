import { getContent } from '../../sdk-src/functions/get-content'
import { API_KEY } from '../../builderConfig'
import { RenderContent, getBuilderSearchParams } from '@/sdk-src'
import {
  Patch,
  applyPatchWithMinimalMutationChain,
} from '@/sdk-src/helpers/apply-patch-with-mutation'
import CatFacts from '@/components/MyTextBox/CatFacts'
import MyTextBox from '@/components/MyTextBox/MyTextBox'
import { componentInfo } from '@/components/MyTextBox/component-info'
import { cookies } from 'next/headers'
import { BuilderContent } from '@/sdk-src/types/builder-content'

const processCookies = (content: BuilderContent) => {
  const cookieStore = cookies()
  const builderPatches = cookieStore
    .getAll()
    .filter((x) => x.name.startsWith('builder.patch.' + content.id) + '.')
    .map((x) => {
      // split into: `builder.patch.${contentId}.${blockId}.${index}`
      const [, , , blockId, index] = x.name.split('.')

      return {
        blockId,
        index: parseInt(index),
        value: x.value,
      }
    })
    .sort((a, b) => a.index - b.index)

  if (!builderPatches.length) return content

  let newContent = content
  for (const patchCookie of builderPatches) {
    const { value } = patchCookie
    try {
      const blockPatches = JSON.parse(value) as Patch[]
      for (const patch of blockPatches) {
        newContent = applyPatchWithMinimalMutationChain(newContent, patch, true)
      }
    } catch (e) {
      console.log('error parsing patch cookie', { value })
      console.log('ignoring cookie')
    }
  }

  return newContent
}

async function getBuilderContent(
  props: MyPageProps
): Promise<BuilderContent | null> {
  const urlPath = '/' + (props.params?.slug?.join('/') || '')

  // props.searchParams['builder.edit-counter']
  const content = await getContent({
    model: 'page',
    apiKey: API_KEY,
    userAttributes: { urlPath },
    options: getBuilderSearchParams(props.searchParams),
  })

  return content ? processCookies(content) : content
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
