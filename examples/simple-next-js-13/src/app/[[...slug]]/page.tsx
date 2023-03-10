import { builder , Builder } from '@builder.io/sdk'

Builder.isReact = true
// ✅ This pattern works. You can pass a Server Component
// as a child or prop of a Client Component.
import ClientComponent from './ClientComponent';
import builderConfig from '../../../builderConfig.json'

builder.init(builderConfig.apiKey)

async function getBuilderContent(urlPath: string) {
  const page =
  (await builder
    .get('page', {
      userAttributes: {
        urlPath,
      },
    })
    .toPromise())
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  return {
    page: page || null
  }
}


// Pages are Server Components by default
export default async function Page(props: any) {
  const urlPath = '/'.concat(props?.params?.slug || '')
  const content = await getBuilderContent(urlPath)

  if (!content.page) {
    return (
      <>
        <h1>404</h1>
        <p>Make sure you have your content published at builder.io.</p>
      </>
    )
  }
  return (
    <>
      <ClientComponent builderContent={content.page}>
        <h1>Header from server</h1>
      </ClientComponent>
    </>
  );
}

export const revalidate = 4;