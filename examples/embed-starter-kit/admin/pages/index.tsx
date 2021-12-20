import React, { useEffect, useState } from 'react'
import Form from '@rjsf/material-ui'
import { Button, CircularProgress, Paper, Toolbar } from '@material-ui/core'
import JSONTree from 'react-json-tree'
import auth0 from 'helpers/auth0'
import ZoomIn from '@material-ui/icons/ZoomIn'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'

export default function Home({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [response, setResponse] = useState()
  const [spaces, setSpaces] = useState([])
  const [loadingSpaces, setLoadingSpaces] = useState(true)

  const [loadingResponse, setLoadingResponse] = useState(false)

  useEffect(() => {
    async function fetchSpaces() {
      setLoadingSpaces(true)
      const res = await fetch(`/api/spaces`)
        .then((res) => res.json())
        .then((res) => res.data.spaces)
      setSpaces(res)
      setLoadingSpaces(false)
    }
    fetchSpaces()
  }, [loadingResponse])

  if (loadingSpaces) {
    return (
      <Toolbar>
        <CircularProgress></CircularProgress>
      </Toolbar>
    )
  }
  return (
    <Paper>
      {spaces.length === 0 && (
        <div
          style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}
        >
          <Form
            onSubmit={async (e) => {
              const spaceConfig = e.formData
              setLoadingResponse(true)
              const response = await fetch('/api/spaces', {
                method: 'POST',
                body: JSON.stringify(spaceConfig),
              }).then((res) => res.json())
              setResponse(response)
              setLoadingResponse(false)
            }}
            action="Create new space"
            schema={{
              title: 'Create a new store',
              description:
                'Configurations here will be used to instantiate a new space in builder with the desired config',
              type: 'object',
              properties: {
                storeId: {
                  type: 'string',
                },
                storeName: {
                  type: 'string',
                },
                storeConfig: {
                  title: 'Configuration object',
                  properties: {
                    foo: {
                      type: 'string',
                    },
                    bar: {
                      type: 'string',
                    },
                  },
                },
              },
            }}
          ></Form>
        </div>
      )}
      {loadingResponse && 'Creating new space .... '}
      {spaces.map((space: any) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button href={`/builder-spaces/${space.id}`}>
            <ZoomIn />
          </Button>
          <JSONTree shouldExpandNode={() => true} data={space} />
        </div>
      ))}
    </Paper>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth0.getSession(context.req, context.res)
  if (session?.user) {
    return {
      props: {
        user: session.user,
      },
    }
  }
  return {
    redirect: {
      permanent: false,
      destination: '/api/login',
    },
    props: {},
  }
}
