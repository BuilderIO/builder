import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Container from '@/components/container';
import PostBody from '@/components/post-body';
import Header from '@/components/header';
import PostHeader from '@/components/post-header';
import Layout from '@/components/layout';
import PostTitle from '@/components/post-title';
import Head from 'next/head';
import { Builder, builder, BuilderContent, useIsPreviewing } from '@builder.io/react';
import '@builder.io/widgets';

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);

Builder.isStatic = true;

// Post model created to display a specific blog post.
// read more at: https://www.builder.io/blog/creating-blog
export default function Post({ post }) {
  const router = useRouter();
  const isPreviewing = useIsPreviewing();
  if (!router.isFallback && !post && !isPreviewing) {
    return <ErrorPage statusCode={404} />;
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
              modelName="posts"
              options={{ includeRefs: true }}
              isStatic
            >
              {data =>
                data && (
                  <article>
                    <Head>
                      <title>{data.title} | Next.js Blog Example with Builder.io</title>
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
                    <p>{post.data.intro}</p>
                    <PostBody content={post} />
                  </article>
                )
              }
            </BuilderContent>
          </>
        )}
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const slug = params.slug;

  /*
    usage of our react sdks to fetch data
    more of our react sdk at:
    https://github.com/BuilderIO/builder/tree/main/packages/react
  */

  let post = await builder
    .get('post', {
      includeRefs: true,
      preview: 'post',
      options: {
        noTargeting: true,
      },
      query: {
        'data.slug': { $eq: slug },
      },
    })
    .toPromise();

  return {
    props: {
      key: post?.id + post?.data.slug + params.slug,
      post,
    },
  };
}

export async function getStaticPaths() {
  const allPosts = await builder.getAll('posts', {
    options: { noTargeting: true },
  });
  return {
    paths: allPosts?.map(post => `/blog/${post.data.slug}`) || [],
    fallback: true,
  };
}
