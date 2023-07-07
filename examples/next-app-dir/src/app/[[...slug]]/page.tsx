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
import { Dictionary } from '@/sdk-src/types/typescript'
import { cookies } from 'next/headers'
import { BuilderContent } from '@/sdk-src/types/builder-content'

const deleteCookie = async (name: string) => {
  'use server'
  const cookieStore = cookies()
  cookieStore.delete(name)
}

const processCookies = (content: BuilderContent) => {
  const cookieStore = cookies()
  const builderPatches = cookieStore
    .getAll()
    .filter((x) => x.name.startsWith('builder.patch.'))
    .map((x) => {
      return {
        blockId: x.name.split('builder.patch.')[1],
        value: x.value,
      }
    })

  if (!builderPatches.length) return content

  // console.log('found cookies, doing things')
  let newContent = content
  for (const patchCookie of builderPatches) {
    const { blockId, value } = patchCookie

    // console.log({ value })
    try {
      const blockPatches = JSON.parse(value) as Patch[]
      for (const patch of blockPatches) {
        newContent = applyPatchWithMinimalMutationChain(newContent, patch, true)
      }
    } catch (e) {
      console.log('error parsing patch cookie', { value })
      console.log('ignoring cookie')
      // deleteCookie(`builder.patch.${blockId}`)
    }
  }

  return newContent
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

async function getBuilderContent(
  props: MyPageProps
): Promise<BuilderContent | null> {
  const urlPath = '/' + (props.params?.slug?.join('/') || '')

  const content = await getContent({
    model: 'page',
    apiKey: API_KEY,
    userAttributes: { urlPath },
    options: getBuilderSearchParams(props.searchParams),
  })

  const cookieStore = cookies()
  const lastUpdated = cookieStore.get('builder.hardReset')?.value

  if (lastUpdated && content?.lastUpdated) {
    const lastUpdatedNumber = parseInt(lastUpdated)
    if (!isNaN(lastUpdatedNumber) && lastUpdatedNumber > content.lastUpdated) {
      console.log('preview data is stale. Refetching...')
      console.log({
        lastUpdatedNumber,
        contentLastUpdated: content.lastUpdated,
      })
      await delay(1000)
      return await getBuilderContent(props)
    }
    console.log('preview data is fresh', {
      lastUpdatedNumber,
      contentLastUpdated: content.lastUpdated,
    })
  } else {
    console.log('no last updated cookie.')
  }

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
