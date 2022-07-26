import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '@/components/container'
import PostBody from '@/components/post-body'
import Header from '@/components/header'
import PostHeader from '@/components/post-header'
import SectionSeparator from '@/components/section-separator'
import Layout from '@/components/layout'
import { getAllPostsWithSlug, getPostBySlug } from '@/lib/api'
import PostTitle from '@/components/post-title'
import Head from 'next/head'
import { CMS_NAME, BUILDER_CONFIG } from '@/lib/constants'
import { Builder, builder, BuilderContent, useIsPreviewing } from '@builder.io/react'
import '@builder.io/widgets'

builder.init(BUILDER_CONFIG.apiKey)
Builder.isStatic = true

export default function Post({ post }) {
  const router = useRouter()
  const isPreviewing = useIsPreviewing()
  if (!router.isFallback && !post && !isPreviewing) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Layout>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <BuilderContent
              {...(!isPreviewing && { content: post })}
              modelName={BUILDER_CONFIG.postsModel}
              options={{ includeRefs: true, model: BUILDER_CONFIG.postsModel }}
              isStatic
            >
              {(data) =>
                data && (
                  <article>
                    <Head>
                      <title>
                        {data.title} | Next.js Blog Example with {CMS_NAME}
                      </title>
                      <meta property="og:image" content={data.image} />
                    </Head>
                    {data.author?.value && (
                      <PostHeader
                        title={data.title}
                        coverImage={data.image}
                        date={post.lastUpdated}
                        author={data.author.value?.data}
                      />
                    )}
                    <p>
                      {post.data.intro}
                    </p>
                    <PostBody content={post} />
                  </article>
                )
              }
            </BuilderContent>
            <SectionSeparator />
            {/* {morePosts.length > 0 && <MoreStories posts={morePosts} />} */}
          </>
        )}
      </Container>
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  let { post } = await getPostBySlug(
    params.handle,
  )

  return {
    props: {
      key: post?.id + post?.data.slug + params.handle,
      post,
    },
  }
}

export async function getStaticPaths() {
  const allPosts = await getAllPostsWithSlug()
  return {
    paths: allPosts?.map((post) => `/blog/${post.data.slug}`) || [],
    fallback: true,
  }
}
