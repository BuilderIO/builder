import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import auth0 from 'helpers/auth0'
import { getMinifiedRecord, table } from 'helpers/airtable'
import { useEffect, useState } from 'react'
import useScript from 'react-script-hook'
import { CircularProgress, Toolbar } from '@material-ui/core'

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  const session = await auth0.getSession(context.req, context.res)
  if (!session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: '/api/login',
      },
      props: {
        space: null,
      },
    }
  }
  const space = await table.find(context.params!.id!)
  if (!space || session.user.sub !== space.fields.userId) {
    return {
      notFound: true,
      props: {
        space: null,
      },
    }
  }
  return {
    props: {
      space: getMinifiedRecord(space) as any,
      user: session.user,
    },
  }
}

export default function BuilderSpace({
  space,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [embedToken, setEmbedToken] = useState(null)
  const [loading] = useScript({
    src: 'https://cdn.builder.io/js/embedded-app',
  })
  useEffect(() => {
    async function fetchEmbedToken() {
      const domain = `${location.protocol}//${location.host}/`
      const token = await fetch(
        `/api/get-embed-token?spaceId=${space.fields.spacePublicKey}&domain=${domain}`
      )
        .then((res) => res.json())
        .then((res) => res.token)
      setEmbedToken(token)
    }
    fetchEmbedToken()
  }, [])
  if (loading || !embedToken) {
    return (
      <Toolbar>
        <CircularProgress />
      </Toolbar>
    )
  }
  return (
    !loading &&
    embedToken && (
      <div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          builder-app iframe {
            border: 0; width: 100%; height: 100%;
          }
    `,
          }}
        ></style>
        <builder-app
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
          }}
          api-key={space.fields.spacePublicKey}
          token={embedToken}
        ></builder-app>
      </div>
    )
  )
}
